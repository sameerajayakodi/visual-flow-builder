import React, { useCallback } from 'react';
import { useFlowStore } from '../../store';
import { getNodeColor } from '../../constants';

const ConfigPanel: React.FC = () => {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const nodes = useFlowStore((s) => s.nodes);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const duplicateNode = useFlowStore((s) => s.duplicateNode);
  const rightPanelCollapsed = useFlowStore((s) => s.rightPanelCollapsed);
  const toggleRightPanel = useFlowStore((s) => s.toggleRightPanel);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const handleUpdate = useCallback(
    (field: string, value: any) => {
      if (!selectedNodeId) return;
      updateNodeData(selectedNodeId, { [field]: value } as any);
    },
    [selectedNodeId, updateNodeData]
  );

  if (rightPanelCollapsed || !selectedNode) {
    return null;
  }

  const color = getNodeColor(selectedNode.data.nodeType);
  const isTrigger = selectedNode.data.nodeType === 'trigger';

  return (
    <div className="config-panel">
      {/* Header */}
      <div className="config-panel__header" style={{ borderColor: color }}>
        <div className="config-panel__header-top">
          <span className="config-panel__icon" style={{ background: color + '18' }}>
            {selectedNode.data.icon}
          </span>
          <div className="config-panel__header-info">
            <span className="config-panel__type" style={{ color }}>
              {selectedNode.data.nodeType.charAt(0).toUpperCase() +
                selectedNode.data.nodeType.slice(1)}
            </span>
          </div>
          <button
            className="config-panel__close"
            onClick={toggleRightPanel}
            title="Close panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="config-panel__content">
        {/* Label field — all nodes */}
        <div className="config-field">
          <label className="config-field__label">Label</label>
          <input
            type="text"
            className="config-field__input"
            value={selectedNode.data.label}
            onChange={(e) => handleUpdate('label', e.target.value)}
          />
        </div>

        {/* Description field */}
        <div className="config-field">
          <label className="config-field__label">Description</label>
          <input
            type="text"
            className="config-field__input"
            value={selectedNode.data.description || ''}
            onChange={(e) => handleUpdate('description', e.target.value)}
            placeholder="Add a description..."
          />
        </div>

        <div className="config-panel__divider" />

        {/* ─── Type-specific fields ─── */}

        {/* Trigger Node */}
        {selectedNode.data.nodeType === 'trigger' && (
          <TriggerConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Text Node */}
        {selectedNode.data.nodeType === 'text' && (
          <TextConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Button Node */}
        {selectedNode.data.nodeType === 'button' && (
          <ButtonConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Condition Node */}
        {selectedNode.data.nodeType === 'condition' && (
          <ConditionConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Input Node */}
        {selectedNode.data.nodeType === 'inputRequest' && (
          <InputConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Delay Node */}
        {selectedNode.data.nodeType === 'delay' && (
          <DelayConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* End Node */}
        {selectedNode.data.nodeType === 'end' && (
          <EndConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* HTTP Request Node */}
        {selectedNode.data.nodeType === 'httpRequest' && (
          <HttpRequestConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* AI Prompt Node */}
        {selectedNode.data.nodeType === 'aiPrompt' && (
          <AiPromptConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Save Variable Node */}
        {selectedNode.data.nodeType === 'saveVariable' && (
          <SaveVariableConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Send Email Node */}
        {selectedNode.data.nodeType === 'sendEmail' && (
          <SendEmailConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Notes Node */}
        {selectedNode.data.nodeType === 'notes' && (
          <NotesConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Generic unconfigured state */}
        {!['trigger', 'text', 'button', 'condition', 'inputRequest', 'delay', 'end', 'httpRequest', 'aiPrompt', 'saveVariable', 'sendEmail', 'notes'].includes(selectedNode.data.nodeType) && (
          <div className="config-panel__placeholder">
            <span className="config-panel__placeholder-icon">⚙️</span>
            <p className="config-panel__placeholder-text">
              Configuration for <strong>{selectedNode.data.label}</strong> will be available soon.
            </p>
            <p className="config-panel__placeholder-hint">
              This node type is ready for future expansion.
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {!isTrigger && (
        <div className="config-panel__footer">
          <button
            className="config-panel__btn config-panel__btn--duplicate"
            onClick={() => duplicateNode(selectedNodeId!)}
          >
            ⧉ Duplicate
          </button>
          <button
            className="config-panel__btn config-panel__btn--delete"
            onClick={() => deleteNode(selectedNodeId!)}
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Trigger Config ───
const TriggerConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Trigger Type</label>
      <select
        className="config-field__select"
        value={data.triggerType || 'manual'}
        onChange={(e) => onUpdate('triggerType', e.target.value)}
      >
        <option value="manual">Manual</option>
        <option value="keyword">Keyword</option>
        <option value="schedule">Schedule</option>
        <option value="api">API</option>
        <option value="webhook">Webhook</option>
      </select>
    </div>
    {data.triggerType === 'keyword' && (
      <div className="config-field">
        <label className="config-field__label">Keyword</label>
        <input
          type="text"
          className="config-field__input"
          value={data.config?.keyword || ''}
          onChange={(e) =>
            onUpdate('config', { ...data.config, keyword: e.target.value })
          }
          placeholder="e.g. hello, start, help"
        />
      </div>
    )}
    <div className="config-panel__tip">
      <span>💡</span>
      <span>This is the entry point of your flow. Every flow needs exactly one trigger.</span>
    </div>
  </>
);

// ─── Text Config ───
const TextConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Message</label>
      <textarea
        className="config-field__textarea"
        value={data.message || ''}
        onChange={(e) => onUpdate('message', e.target.value)}
        placeholder="Type your message here..."
        rows={4}
      />
      <span className="config-field__hint">
        Use {'{{variable}}'} to insert dynamic values
      </span>
    </div>
  </>
);

// ─── Button Config ───
const ButtonConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => {
  const buttons = data.buttons || [];
  
  const addButton = () => {
    const newBtn = {
      id: `btn_${Date.now()}`,
      label: `Option ${buttons.length + 1}`,
      value: `option_${buttons.length + 1}`,
      type: 'reply',
    };
    onUpdate('buttons', [...buttons, newBtn]);
  };

  const removeButton = (idx: number) => {
    onUpdate('buttons', buttons.filter((_: any, i: number) => i !== idx));
  };

  const updateButton = (idx: number, field: string, value: string) => {
    const updated = buttons.map((b: any, i: number) =>
      i === idx ? { ...b, [field]: value } : b
    );
    onUpdate('buttons', updated);
  };

  return (
    <>
      <div className="config-field">
        <label className="config-field__label">Message</label>
        <textarea
          className="config-field__textarea"
          value={data.message || ''}
          onChange={(e) => onUpdate('message', e.target.value)}
          placeholder="Please choose an option:"
          rows={2}
        />
      </div>
      <div className="config-field">
        <label className="config-field__label">Buttons</label>
        <div className="config-buttons">
          {buttons.map((btn: any, idx: number) => (
            <div key={btn.id || idx} className="config-button-item">
              <input
                type="text"
                className="config-field__input config-field__input--sm"
                value={btn.label}
                onChange={(e) => updateButton(idx, 'label', e.target.value)}
                placeholder="Button label"
              />
              <button
                className="config-button-remove"
                onClick={() => removeButton(idx)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          <button className="config-button-add" onClick={addButton}>
            + Add Button
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Condition Config ───
const ConditionConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => {
  const rules = data.rules || [];

  const addRule = () => {
    const newRule = {
      id: `rule_${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
    };
    onUpdate('rules', [...rules, newRule]);
  };

  const updateRule = (idx: number, field: string, value: string) => {
    const updated = rules.map((r: any, i: number) =>
      i === idx ? { ...r, [field]: value } : r
    );
    onUpdate('rules', updated);
  };

  const removeRule = (idx: number) => {
    onUpdate('rules', rules.filter((_: any, i: number) => i !== idx));
  };

  return (
    <>
      <div className="config-field">
        <label className="config-field__label">Combinator</label>
        <select
          className="config-field__select"
          value={data.combinator || 'and'}
          onChange={(e) => onUpdate('combinator', e.target.value)}
        >
          <option value="and">All conditions (AND)</option>
          <option value="or">Any condition (OR)</option>
        </select>
      </div>
      <div className="config-field">
        <label className="config-field__label">Rules</label>
        <div className="config-rules">
          {rules.map((rule: any, idx: number) => (
            <div key={rule.id || idx} className="config-rule-item">
              <input
                type="text"
                className="config-field__input config-field__input--sm"
                value={rule.field}
                onChange={(e) => updateRule(idx, 'field', e.target.value)}
                placeholder="Variable"
              />
              <select
                className="config-field__select config-field__select--sm"
                value={rule.operator}
                onChange={(e) => updateRule(idx, 'operator', e.target.value)}
              >
                <option value="equals">equals</option>
                <option value="notEquals">not equals</option>
                <option value="contains">contains</option>
                <option value="greaterThan">greater than</option>
                <option value="lessThan">less than</option>
                <option value="exists">exists</option>
                <option value="notExists">not exists</option>
              </select>
              <input
                type="text"
                className="config-field__input config-field__input--sm"
                value={rule.value}
                onChange={(e) => updateRule(idx, 'value', e.target.value)}
                placeholder="Value"
              />
              <button
                className="config-button-remove"
                onClick={() => removeRule(idx)}
              >
                ✕
              </button>
            </div>
          ))}
          <button className="config-button-add" onClick={addRule}>
            + Add Rule
          </button>
        </div>
      </div>
      <div className="config-panel__tip">
        <span>💡</span>
        <span>Connect the <strong>Yes</strong> (left) and <strong>No</strong> (right) outputs to different paths.</span>
      </div>
    </>
  );
};

// ─── Input Config ───
const InputConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Prompt Message</label>
      <textarea
        className="config-field__textarea"
        value={data.prompt || ''}
        onChange={(e) => onUpdate('prompt', e.target.value)}
        placeholder="What would you like to ask?"
        rows={3}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Save Response As</label>
      <input
        type="text"
        className="config-field__input"
        value={data.variableName || ''}
        onChange={(e) => onUpdate('variableName', e.target.value)}
        placeholder="e.g. user_name, email"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Input Type</label>
      <select
        className="config-field__select"
        value={data.inputType || 'text'}
        onChange={(e) => onUpdate('inputType', e.target.value)}
      >
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="email">Email</option>
        <option value="phone">Phone</option>
        <option value="date">Date</option>
        <option value="select">Selection</option>
      </select>
    </div>
  </>
);

// ─── Delay Config ───
const DelayConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Wait Duration</label>
      <div className="config-field__row">
        <input
          type="number"
          className="config-field__input config-field__input--number"
          value={data.duration || 5}
          onChange={(e) => onUpdate('duration', parseInt(e.target.value) || 0)}
          min={0}
        />
        <select
          className="config-field__select"
          value={data.unit || 'seconds'}
          onChange={(e) => onUpdate('unit', e.target.value)}
        >
          <option value="seconds">Seconds</option>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
      </div>
    </div>
  </>
);

// ─── End Config ───
const EndConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => (
  <>
    <div className="config-field">
      <label className="config-field__label">End Action</label>
      <select
        className="config-field__select"
        value={data.endType || 'complete'}
        onChange={(e) => onUpdate('endType', e.target.value)}
      >
        <option value="complete">Complete Flow</option>
        <option value="redirect">Redirect to Another Flow</option>
        <option value="restart">Restart Flow</option>
      </select>
    </div>
  </>
);

// ─── HTTP Request Config ───
const HttpRequestConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Method</label>
      <select
        className="config-field__select"
        value={data.method || 'GET'}
        onChange={(e) => onUpdate('method', e.target.value)}
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATCH">PATCH</option>
      </select>
    </div>
    <div className="config-field">
      <label className="config-field__label">URL</label>
      <input
        type="text"
        className="config-field__input"
        value={data.url || ''}
        onChange={(e) => onUpdate('url', e.target.value)}
        placeholder="https://api.example.com/endpoint"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Request Body</label>
      <textarea
        className="config-field__textarea config-field__textarea--code"
        value={data.body || ''}
        onChange={(e) => onUpdate('body', e.target.value)}
        placeholder='{"key": "value"}'
        rows={4}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Save Response As</label>
      <input
        type="text"
        className="config-field__input"
        value={data.responseVariable || ''}
        onChange={(e) => onUpdate('responseVariable', e.target.value)}
        placeholder="response"
      />
    </div>
  </>
);

// ─── AI Prompt Config ───
const AiPromptConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => (
  <>
    <div className="config-field">
      <label className="config-field__label">AI Prompt</label>
      <textarea
        className="config-field__textarea"
        value={data.prompt || ''}
        onChange={(e) => onUpdate('prompt', e.target.value)}
        placeholder="Describe what the AI should do..."
        rows={5}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Model</label>
      <select
        className="config-field__select"
        value={data.model || 'gpt-4'}
        onChange={(e) => onUpdate('model', e.target.value)}
      >
        <option value="gpt-4">GPT-4</option>
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        <option value="claude-3">Claude 3</option>
        <option value="gemini-pro">Gemini Pro</option>
      </select>
    </div>
    <div className="config-field">
      <label className="config-field__label">Temperature ({data.temperature || 0.7})</label>
      <input
        type="range"
        className="config-field__range"
        value={data.temperature || 0.7}
        onChange={(e) => onUpdate('temperature', parseFloat(e.target.value))}
        min={0}
        max={1}
        step={0.1}
      />
      <div className="config-field__range-labels">
        <span>Precise</span>
        <span>Creative</span>
      </div>
    </div>
    <div className="config-field">
      <label className="config-field__label">Save Response As</label>
      <input
        type="text"
        className="config-field__input"
        value={data.responseVariable || ''}
        onChange={(e) => onUpdate('responseVariable', e.target.value)}
        placeholder="ai_response"
      />
    </div>
  </>
);

// ─── Save Variable Config ───
const SaveVariableConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Variable Name</label>
      <input
        type="text"
        className="config-field__input"
        value={data.variableName || ''}
        onChange={(e) => onUpdate('variableName', e.target.value)}
        placeholder="e.g. user_score"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Value Type</label>
      <select
        className="config-field__select"
        value={data.valueType || 'static'}
        onChange={(e) => onUpdate('valueType', e.target.value)}
      >
        <option value="static">Static Value</option>
        <option value="expression">Expression</option>
        <option value="fromPrevious">From Previous Step</option>
      </select>
    </div>
    <div className="config-field">
      <label className="config-field__label">Value</label>
      <input
        type="text"
        className="config-field__input"
        value={data.value || ''}
        onChange={(e) => onUpdate('value', e.target.value)}
        placeholder="Enter value..."
      />
    </div>
  </>
);

// ─── Send Email Config ───
const SendEmailConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => (
  <>
    <div className="config-field">
      <label className="config-field__label">To</label>
      <input
        type="text"
        className="config-field__input"
        value={data.to || ''}
        onChange={(e) => onUpdate('to', e.target.value)}
        placeholder="recipient@example.com"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Subject</label>
      <input
        type="text"
        className="config-field__input"
        value={data.subject || ''}
        onChange={(e) => onUpdate('subject', e.target.value)}
        placeholder="Email subject"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Body</label>
      <textarea
        className="config-field__textarea"
        value={data.body || ''}
        onChange={(e) => onUpdate('body', e.target.value)}
        placeholder="Email content..."
        rows={5}
      />
    </div>
  </>
);

// ─── Notes Config ───
const NotesConfig: React.FC<{ data: any; onUpdate: (f: string, v: any) => void }> = ({
  data,
  onUpdate,
}) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Note Content</label>
      <textarea
        className="config-field__textarea"
        value={data.content || ''}
        onChange={(e) => onUpdate('content', e.target.value)}
        placeholder="Write your note here..."
        rows={6}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Color</label>
      <div className="config-color-grid">
        {['#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#f3e8ff', '#e0e7ff'].map(
          (c) => (
            <button
              key={c}
              className={`config-color-swatch ${data.color === c ? 'config-color-swatch--active' : ''}`}
              style={{ background: c }}
              onClick={() => onUpdate('color', c)}
            />
          )
        )}
      </div>
    </div>
  </>
);

export default ConfigPanel;
