import React, { useState, useEffect, useRef } from 'react';
import { useFlowStore } from '../../store';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: any[];
  inputFormat?: string;
  mediaUrl?: string;
  mediaType?: string;
  isEnd?: boolean;
}

const SimulatorMessageOptions: React.FC<{ options: any[]; inputFormat?: string; onSelect: (opt: any | any[]) => void }> = ({ options, inputFormat, onSelect }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const format = inputFormat?.toUpperCase() || 'BUTTON';

  if (format === 'LIST' || format === 'DROPDOWN') {
    return (
      <div className="simulator-options-list">
        <select 
          className="simulator-select" 
          onChange={(e) => {
            const opt = options.find((o) => o.text === e.target.value);
            if (opt) onSelect(opt);
          }}
          defaultValue=""
        >
          <option value="" disabled>Select an option...</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt.text}>{opt.text}</option>
          ))}
        </select>
      </div>
    );
  }

  if (format === 'RADIO') {
    return (
      <div className="simulator-options-radio">
        {options.map((opt, idx) => (
          <label key={idx} className="simulator-radio-label">
            <input 
              type="radio" 
              name={`radio-${options[0].id || Math.random()}`}
              value={opt.text}
              onChange={() => setSelected([opt.text])}
              checked={selected.includes(opt.text)}
            />
            <span>{opt.text}</span>
          </label>
        ))}
        <button 
          className="simulator-submit-btn" 
          disabled={selected.length === 0}
          onClick={() => {
            const opt = options.find((o) => o.text === selected[0]);
            if (opt) onSelect(opt);
          }}
        >
          Send
        </button>
      </div>
    );
  }

  if (format === 'CHECKBOX') {
    return (
      <div className="simulator-options-checkbox">
        {options.map((opt, idx) => (
          <label key={idx} className="simulator-checkbox-label">
            <input 
              type="checkbox"
              value={opt.text}
              checked={selected.includes(opt.text)}
              onChange={(e) => {
                if (e.target.checked) setSelected([...selected, opt.text]);
                else setSelected(selected.filter(s => s !== opt.text));
              }}
            />
            <span>{opt.text}</span>
          </label>
        ))}
        <button 
          className="simulator-submit-btn" 
          disabled={selected.length === 0}
          onClick={() => {
            // For multichoice, we might need a custom option object or we just pick the first option's nextPIndex
            // and pass the joined string as text.
            const text = selected.join(', ');
            // find the matching option just for routing, or use a default one
            // if no specific route for checkbox combination, we just use the first selected option's routing
            const routeOpt = options.find(o => o.text === selected[0]);
            if (routeOpt) {
              onSelect({ ...routeOpt, text });
            }
          }}
        >
          Send
        </button>
      </div>
    );
  }

  // Default: BUTTON
  return (
    <div className="simulator-options">
      {options.map((opt, idx) => (
        <button key={idx} className="simulator-option-btn" onClick={() => onSelect(opt)}>
          {opt.text}
        </button>
      ))}
    </div>
  );
};

const SimulatorPanel: React.FC = () => {
  const exportFlow = useFlowStore((s) => s.exportFlow);
  const darkMode = useFlowStore((s) => s.darkMode);
  const flowName = useFlowStore((s) => s.flowName);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [prompts, setPrompts] = useState<any[]>([]);
  const [activePromptIndex, setActivePromptIndex] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSimulation = () => {
    const flow = exportFlow();
    setPrompts(flow.prompts || []);
    setVariables({});
    setMessages([{
      id: Date.now().toString(),
      sender: 'bot',
      text: 'Simulation started. Type a trigger keyword (e.g. "hello") to begin.'
    }]);
    setActivePromptIndex(null);
  };

  useEffect(() => {
    startSimulation();
  }, []); // Restart when opened

  const processPrompt = (pIndex: number, currentVars: Record<string, string>) => {
    const prompt = prompts.find((p) => p.pIndex === pIndex);
    if (!prompt) {
      addBotMessage('Flow Error: Prompt not found.', true);
      setActivePromptIndex(null);
      return;
    }

    // Interpolate variables
    let text = prompt.text || '';
    text = text.replace(/\{\{(.*?)\}\}/g, (_: string, key: string) => currentVars[key.trim()] || '');

    const props = prompt.props || [];

    if (props.includes('END')) {
      addBotMessage(text || 'Flow Ended.', true);
      setActivePromptIndex(null);
      return;
    }

    if (props.includes('SINGLE_CHOICE') || props.includes('MULTI_CHOICE') || prompt.answers?.length > 0) {
      const inputFormat = prompt.answers?.[0]?.props?.[0] || 'BUTTON';
      addBotMessage(text, false, prompt.answers, inputFormat);
      setActivePromptIndex(pIndex);
      return;
    }

    if (props.includes('TEXT') && (prompt.variableName || prompt.description?.toLowerCase().includes('ask'))) {
      addBotMessage(text);
      setActivePromptIndex(pIndex);
      return;
    }

    // Otherwise, it's just a message or something that doesn't wait for input
    addBotMessage(text);
    
    if (prompt.nextPIndex !== null && prompt.nextPIndex !== undefined) {
      // Small delay to feel natural
      setTimeout(() => {
        processPrompt(prompt.nextPIndex, currentVars);
      }, 500);
    } else {
      setActivePromptIndex(null);
    }
  };

  const addBotMessage = (text: string, isEnd = false, options?: any[], inputFormat?: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString() + Math.random(), sender: 'bot', text, options, inputFormat, isEnd }]);
  };

  const addUserMessage = (text: string, mediaUrl?: string, mediaType?: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString() + Math.random(), sender: 'user', text, mediaUrl, mediaType }]);
  };

  const handleOptionClick = (option: any) => {
    addUserMessage(option.text);
    const activePrompt = prompts.find((p) => p.pIndex === activePromptIndex);
    
    let newVars = { ...variables };
    if (activePrompt && activePrompt.variableName) {
      newVars[activePrompt.variableName] = option.text; // or option.key
      setVariables(newVars);
    }

    const nextIdx = option.nextPIndex !== undefined ? option.nextPIndex : activePrompt?.nextPIndex;
    
    if (nextIdx !== null && nextIdx !== undefined) {
      setTimeout(() => processPrompt(nextIdx, newVars), 300);
    } else {
      setActivePromptIndex(null);
    }
  };

  const handleSend = (overrideText?: string, mediaUrl?: string, mediaType?: string) => {
    const text = typeof overrideText === 'string' ? overrideText : inputValue.trim();
    if (!text && !mediaUrl) return;
    if (typeof overrideText !== 'string') setInputValue('');
    addUserMessage(text, mediaUrl, mediaType);

    if (activePromptIndex === null) {
      // Check for trigger
      const trigger = prompts.find(p => p.props?.includes('TRIGGER') && p.config?.keyword?.toLowerCase() === text.toLowerCase());
      if (trigger && trigger.nextPIndex !== null) {
        setTimeout(() => processPrompt(trigger.nextPIndex, variables), 300);
      } else {
        setTimeout(() => addBotMessage('No matching trigger found. Try "hello".'), 300);
      }
      return;
    }

    const activePrompt = prompts.find((p) => p.pIndex === activePromptIndex);
    if (!activePrompt) return;

    let newVars = { ...variables };
    if (activePrompt.variableName) {
      newVars[activePrompt.variableName] = text;
      setVariables(newVars);
    }

    if (activePrompt.nextPIndex !== null && activePrompt.nextPIndex !== undefined) {
      setTimeout(() => processPrompt(activePrompt.nextPIndex, newVars), 300);
    } else {
      setActivePromptIndex(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        handleSend('', audioUrl, 'audio');
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className={`simulator-panel ${darkMode ? 'dark' : ''}`}>
      <div className="simulator-header">
        <div className="simulator-header-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {flowName}
        </div>
        <button className="simulator-restart-btn" onClick={startSimulation} title="Restart Simulation">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
      </div>

      <div className="simulator-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`simulator-msg-wrap ${msg.sender}`}>
            <div className={`simulator-msg ${msg.sender}`}>
              {msg.mediaUrl && (
                <div className="simulator-msg-media">
                  {msg.mediaType === 'image' ? (
                    <img src={msg.mediaUrl} alt="uploaded media" className="simulator-media-img" />
                  ) : msg.mediaType === 'video' ? (
                    <video src={msg.mediaUrl} controls className="simulator-media-video" />
                  ) : msg.mediaType === 'audio' ? (
                    <audio src={msg.mediaUrl} controls className="simulator-media-audio" style={{ maxWidth: '100%' }} />
                  ) : (
                    <div className="simulator-media-file">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                      </svg>
                      File Attached
                    </div>
                  )}
                </div>
              )}
              {msg.text && <div className="simulator-msg-text">{msg.text}</div>}
              {msg.options && msg.options.length > 0 && (
                <SimulatorMessageOptions 
                  options={msg.options} 
                  inputFormat={msg.inputFormat} 
                  onSelect={handleOptionClick} 
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="simulator-input-area">
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'file';
              handleSend('', url, type);
            }
            e.target.value = '';
          }} 
        />
        <button className="simulator-icon-btn" title="Attach Media" onClick={() => fileInputRef.current?.click()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
        </button>
        <input
          type="text"
          className="simulator-input"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        {!inputValue.trim() ? (
          <button 
            className="simulator-icon-btn" 
            title={isRecording ? "Stop Recording" : "Voice Message"} 
            onClick={isRecording ? stopRecording : startRecording}
            style={isRecording ? { color: '#ef4444' } : {}}
          >
            {isRecording ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            )}
          </button>
        ) : (
          <button className="simulator-send-btn" onClick={() => handleSend()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SimulatorPanel;
