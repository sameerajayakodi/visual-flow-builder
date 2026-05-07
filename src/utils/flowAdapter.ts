import type { FlowNode, FlowEdge, QuestionnaireNodeData } from '../types';

/**
 * Convert internal React Flow state (nodes + edges) into 
 * the senior engineer's clean { prompts: [...] } format.
 * 
 * Rules:
 *  - Only questionnaire nodes become prompts
 *  - Each answer's nextPIndex is resolved from the visual edge connections
 *  - No visual metadata (positions, IDs, etc.) is included — CLEAN JSON
 *  - Button/Text/Card nodes are NOT exported as prompts (they are visual-only)
 */
export function flowToPrompts(nodes: FlowNode[], edges: FlowEdge[]) {
  const prompts: any[] = [];

  // Only export questionnaire nodes as prompts
  const qNodes = nodes.filter(n => n.type === 'questionnaire');

  qNodes.forEach(node => {
    const data = node.data as QuestionnaireNodeData;

    const promptProps = Array.isArray(data.promptProps)
      ? data.promptProps
      : (data.promptProps ? [data.promptProps] : ['SINGLE_CHOICE']);

    const answers = (data.answers || []).map(ans => {
      // Find edge from this answer handle to the next node
      const edge = edges.find(e => e.source === node.id && e.sourceHandle === ans.id);
      let nextPIndex = 99; // Default: go to END
      let nextPromptLanguage = data.language || 'ENGLISH';

      if (edge) {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode && targetNode.type === 'questionnaire') {
          const targetData = targetNode.data as QuestionnaireNodeData;
          nextPIndex = Number(targetData.pIndex) || 0;
          nextPromptLanguage = targetData.language || 'ENGLISH';
        }
      }

      // Clean answer — no internal IDs
      return {
        aIndex: Number(ans.aIndex),
        keyPattern: ans.keyPattern || String(ans.aIndex),
        keyPatternHuman: ans.keyPatternHuman || String(ans.aIndex),
        text: ans.text,
        props: ans.props && ans.props.length ? ans.props : ['BUTTON'],
        nextPromptLanguage,
        nextPIndex,
      };
    });

    // Clean prompt — no visual metadata
    prompts.push({
      pIndex: Number(data.pIndex) || 0,
      key: data.promptKey || 'prompt',
      language: data.language || 'ENGLISH',
      text: data.text || '',
      props: promptProps,
      answers,
    });
  });

  // Sort by pIndex for clean output
  prompts.sort((a, b) => a.pIndex - b.pIndex);

  return prompts;
}
