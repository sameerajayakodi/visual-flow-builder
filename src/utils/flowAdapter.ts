import type { FlowDocument, FlowNode, FlowEdge, QuestionnaireNodeData } from '../types';

export function flowToPrompts(nodes: FlowNode[], edges: FlowEdge[]) {
  const prompts: any[] = [];
  
  nodes.forEach(node => {
    // If it's a questionnaire node, use its real properties, otherwise synthesize them
    let pIndex = 0;
    let key = node.id;
    let language = 'ENGLISH';
    let text = node.data.label || '';
    let props = ['UNKNOWN'];
    let answers: any[] = [];
    
    if (node.type === 'questionnaire') {
      const data = node.data as QuestionnaireNodeData;
      pIndex = Number(data.pIndex) || 0;
      key = data.promptKey || 'prompt';
      language = data.language || 'ENGLISH';
      text = data.text || '';
      props = Array.isArray(data.promptProps) ? data.promptProps : (data.promptProps ? [data.promptProps] : ["SINGLE_CHOICE"]);
      
      answers = (data.answers || []).map(ans => {
        const edge = edges.find(e => e.source === node.id && e.sourceHandle === ans.id);
        let nextPIndex = 99; // Default to 99 (usually END) if not connected
        let nextPromptLanguage = language;
        
        if (edge) {
          const targetNode = nodes.find(n => n.id === edge.target);
          if (targetNode && targetNode.type === 'questionnaire') {
            const targetData = targetNode.data as QuestionnaireNodeData;
            nextPIndex = Number(targetData.pIndex) || 0;
            nextPromptLanguage = targetData.language || 'ENGLISH';
          }
        }
        
        return {
          aIndex: Number(ans.aIndex),
          keyPattern: ans.keyPattern,
          keyPatternHuman: ans.keyPatternHuman,
          text: ans.text,
          props: ans.props && ans.props.length ? ans.props : ["BUTTON"],
          nextPromptLanguage,
          nextPIndex,
          id: ans.id // preserve UI id
        };
      });
    } else {
      // For non-questionnaire nodes, synthesize as a generic prompt to align everything
      pIndex = Math.floor(Math.random() * 1000) + 100; // Fake ID
      props = [(node.type || 'UNKNOWN').toUpperCase()];
      // Find single outgoing edge
      const edge = edges.find(e => e.source === node.id);
      if (edge) {
         // Just a generic answer to connect them
         answers.push({
           aIndex: 1, keyPattern: '1', keyPatternHuman: '1', text: 'Continue', props: ['BUTTON'],
           nextPIndex: 99, // Will be linked up properly if target is questionnaire
           id: 'source'
         });
      }
    }
    
    prompts.push({
      pIndex,
      key,
      language,
      text,
      props,
      answers,
      // Visual Builder Metadata
      id: node.id,
      type: node.type,
      position: node.position,
      width: node.width,
      height: node.height,
      data: node.data
    });
  });
  
  return prompts;
}

export function promptsToFlow(prompts: any[]) {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  
  prompts.forEach(p => {
    // Reconstruct React Flow Node
    const node: FlowNode = {
      id: p.id || `node_${p.pIndex}`,
      type: p.type || 'questionnaire',
      position: p.position || { x: 100, y: 100 },
      width: p.width,
      height: p.height,
      data: p.data || {
        label: p.key || 'Survey Prompt',
        nodeType: 'questionnaire',
        category: 'message',
        icon: '📋',
        isConfigured: true,
        hasError: false,
        pIndex: p.pIndex,
        promptKey: p.key,
        language: p.language,
        text: p.text,
        promptProps: p.props,
        answers: (p.answers || []).map((a: any) => ({
           id: a.id || `ans_${a.aIndex}`,
           aIndex: a.aIndex,
           keyPattern: a.keyPattern,
           keyPatternHuman: a.keyPatternHuman,
           text: a.text,
           props: a.props
        }))
      }
    };
    nodes.push(node);
    
    // Reconstruct React Flow Edges
    if (p.answers) {
      p.answers.forEach((a: any) => {
        if (a.nextPIndex !== undefined && a.nextPIndex !== null && a.nextPIndex !== 99) {
          const targetPrompt = prompts.find(tp => tp.pIndex === a.nextPIndex);
          if (targetPrompt) {
            edges.push({
              id: `e_${node.id}_${a.id || a.aIndex}`,
              source: node.id,
              target: targetPrompt.id || `node_${targetPrompt.pIndex}`,
              sourceHandle: a.id || `ans_${a.aIndex}`,
              animated: true
            });
          }
        }
      });
    }
  });
  
  return { nodes, edges };
}
