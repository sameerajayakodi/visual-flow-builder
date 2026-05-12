import type { FlowNode, FlowEdge, QuestionnaireNodeData } from '../types';
import { NODE_LIBRARY } from '../constants/nodeLibrary';

// ─────────────────────────────────────────────────────────────
// PROMPTS EXPORT — questionnaire nodes only (senior engineer format)
// ─────────────────────────────────────────────────────────────

/**
 * Convert questionnaire nodes + edges into clean prompts JSON.
 * 
 * promptIndex is AUTO-GENERATED (1, 2, 3...) based on Y-position order.
 * nextPromptIndex is resolved from the visual edge connections.
 * No manual pIndex needed — the visual flow IS the source of truth.
 */
export function flowToPrompts(nodes: FlowNode[], edges: FlowEdge[]) {
  const prompts: any[] = [];

  const stepNodes = nodes.filter(n => n.data.nodeType !== 'notes');
  const globalNodeIndexMap = new Map<string, number>();

  // Sort ALL step nodes by Y position (top to bottom)
  const sortedNodes = stepNodes.sort((a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0));

  sortedNodes.forEach((node, i) => {
    globalNodeIndexMap.set(node.id, i);
  });

  sortedNodes.forEach((node, i) => {
    const d = node.data as any;

    let text = d.text || d.message || '';
    if (!text && d.nodeType === 'trigger') text = 'Flow Start';

    let type = d.promptProps ? (Array.isArray(d.promptProps) ? d.promptProps : [d.promptProps]) : [d.nodeType.toUpperCase()];
    let language = d.language || 'ENGLISH';
    let key = d.promptKey || `${d.nodeType}_${i}`;

    const prompt: any = {
      pIndex: i,
      key: key,
      language: language,
      text: text,
      props: type,
    };

    const libItem = NODE_LIBRARY.find(item => item.type === d.nodeType);
    if (d.description) {
      prompt.description = d.description;
    } else if (libItem?.description) {
      prompt.description = libItem.description;
    }

    // Embed all other config fields dynamically so nothing is lost
    const skipKeys = new Set([
      'nodeType', 'category', 'icon', 
      'isConfigured', 'hasError', 'errorMessage', 'description',
      'pIndex', 'aIndex', 'keyPattern', 'keyPatternHuman',
      'promptProps', 'promptKey', 'text', 'message', 'language', 'answers', 'cases', 'buttons', 'variables'
    ]);
    
    for (const [k, v] of Object.entries(d)) {
      if (!skipKeys.has(k)) {
        prompt[k] = v;
      }
    }

    prompt.answers = [];
    const outEdges = edges.filter(e => e.source === node.id);

    const inEdges = edges.filter(e => e.target === node.id);
    const prevPIndices = inEdges.map(e => {
      const sourceNode = sortedNodes.find(n => n.id === e.source);
      return sourceNode ? globalNodeIndexMap.get(sourceNode.id) : null;
    }).filter(i => i !== null && i !== undefined) as number[];

    if (prevPIndices.length === 1) {
      prompt.prevPIndex = prevPIndices[0];
    } else if (prevPIndices.length > 1) {
      prompt.prevPIndex = prevPIndices;
    } else {
      prompt.prevPIndex = null;
    }

    if (d.nodeType === 'questionnaire' && !type.includes('TEXT') && !type.includes('ENDING')) {
      const inputFormat = (d.inputFormat || 'BUTTON').toUpperCase();
      prompt.answers = (d.answers || []).map((ans: any, ansIdx: number) => {
        const edge = outEdges.find(e => e.sourceHandle === ans.id);
        let nextPIndex: number | null = null;
        let nextPromptLanguage = language;
        
        if (edge) {
          const targetNode = sortedNodes.find(n => n.id === edge.target);
          if (targetNode) {
            nextPIndex = globalNodeIndexMap.get(targetNode.id) ?? null;
            nextPromptLanguage = (targetNode.data as any).language || 'ENGLISH';
          }
        }

        const aIndex = ans.aIndex || (ansIdx + 1);

        return {
          aIndex,
          key: ans.value || null,
          text: ans.text,
          props: [inputFormat],
          nextPromptLanguage,
          nextPIndex,
        };
      });
    } else {
      // For non-questionnaire or single-route nodes
      if (outEdges.length > 0) {
        if (d.nodeType === 'condition' || d.nodeType === 'randomSplit' || d.buttons?.length > 0 || d.cases?.length > 0) {
           outEdges.forEach((edge, eIdx) => {
              const targetNode = sortedNodes.find(n => n.id === edge.target);
              const nextPIndex = targetNode ? (globalNodeIndexMap.get(targetNode.id) ?? null) : null;
              
              let ansText = 'Route';
              let aIndex = eIdx + 1;
              
              if (d.buttons?.length) {
                const match = d.buttons.find((b: any) => b.id === edge.sourceHandle);
                if (match) ansText = match.label;
              } else if (d.cases?.length) {
                const match = d.cases.find((c: any) => c.id === edge.sourceHandle);
                if (match) ansText = match.label || match.value;
              } else if (d.nodeType === 'condition') {
                ansText = edge.sourceHandle === 'yes' ? 'Yes' : 'No';
                aIndex = edge.sourceHandle === 'yes' ? 1 : 2;
              }

              prompt.answers.push({
                aIndex,
                key: ansText,
                text: ansText,
                props: ['ROUTE'],
                nextPIndex,
              });
           });
        } else {
          // Single default output
          const targetNode = sortedNodes.find(n => n.id === outEdges[0].target);
          if (targetNode) {
            prompt.nextPIndex = globalNodeIndexMap.get(targetNode.id) ?? null;
          } else {
            prompt.nextPIndex = null;
          }
        }
      } else {
        // No outgoing edges
        prompt.nextPIndex = null;
      }
    }

    if (prompt.answers.length === 0) {
      delete prompt.answers;
    }
    
    // Fallback for single route nodes
    if (!prompt.answers && prompt.nextPIndex === undefined) {
      prompt.nextPIndex = null;
    }

    prompts.push(prompt);
  });

  return prompts;
}

// ─────────────────────────────────────────────────────────────
// STEPS EXPORT — ALL node types (generic flow execution format)
// ─────────────────────────────────────────────────────────────

export interface FlowStep {
  /** Unique step identifier (integer index) */
  id: number;
  /** Node type: trigger, text, button, questionnaire, condition, delay, end, etc. */
  type: string;
  /** Human-readable name */
  name: string;
  /** Step-specific configuration (message, buttons, answers, etc.) */
  config: Record<string, any>;
  /** 
   * Routing map: where to go next.
   * 
   * Keys are INTEGER INDEXES as strings:
   *   - `"default"` → auto-advance (no user input needed)
   *   - `"1"`, `"2"`, `"3"` → user choice routes
   *   - empty `{}` → flow ends
   * 
   * Labels for each index are in config.buttons or config.answers.
   */
  nextSteps: Record<string, number>;
}

/**
 * Convert nodes + edges into a flat list of FlowSteps.
 * 
 * Route keys are INTEGER INDEXES (1, 2, 3), not label strings.
 * Labels are stored in config.buttons/answers for display;
 * nextSteps only carries the index → targetStepId mapping.
 */
export function flowToSteps(nodes: FlowNode[], edges: FlowEdge[]): FlowStep[] {
  const steps: FlowStep[] = [];

  const stepNodes = nodes.filter(n => n.data.nodeType !== 'notes');
  const globalNodeIndexMap = new Map<string, number>();
  stepNodes.forEach((node, i) => {
    globalNodeIndexMap.set(node.id, i);
  });

  stepNodes.forEach(node => {
    const d = node.data as any;

    // ─── Build config (clean, no visual metadata) ───
    const config: Record<string, any> = {};
    const skipKeys = new Set([
      'label', 'nodeType', 'category', 'icon', 
      'isConfigured', 'hasError', 'errorMessage',
      'pIndex', 'aIndex', 'keyPattern', 'keyPatternHuman',
    ]);
    
    for (const [key, value] of Object.entries(d)) {
      if (skipKeys.has(key)) continue;

      if (key === 'buttons' && Array.isArray(value)) {
        config.buttons = (value as any[]).map((b, i) => ({
          index: i + 1,
          label: b.label,
        }));

      } else if (key === 'answers' && Array.isArray(value)) {
        config.answers = (value as any[]).map((a, i) => {
          const ans: any = { index: i + 1, text: a.text };
          if (a.value) ans.value = a.value;
          return ans;
        });

      } else if (key === 'cases' && Array.isArray(value)) {
        config.cases = (value as any[]).map((c, i) => ({
          index: i + 1,
          label: c.label,
          value: c.value,
        }));

      // ─── Rename internal keys to readable names ───
      } else if (key === 'promptKey') {
        config.promptKey = value;
      } else if (key === 'promptProps') {
        const arr = Array.isArray(value) ? value : (value ? [value] : []);
        config.promptType = arr;
      } else if (key === 'inputType') {
        config.expectedInputType = value;
      } else if (key === 'variableName') {
        config.saveToVariable = value;
      } else if (key === 'responseVariable') {
        config.saveResponseTo = value;
      } else if (key === 'endType') {
        config.endAction = value;
      } else if (key === 'combinator') {
        config.ruleCombinator = value;
      } else if (key === 'isHtml') {
        config.htmlEmail = value;
      } else {
        config[key] = value;
      }
    }

    // ─── Inject description from library if not provided by user ───
    if (!config.description) {
      const libItem = NODE_LIBRARY.find(item => item.type === d.nodeType);
      if (libItem?.description) {
        config.description = libItem.description;
      }
    }

    // ─── Build nextSteps from edges using integer indexes ───
    const nextSteps: Record<string, number> = {};
    const outEdges = edges.filter(e => e.source === node.id);

    if (outEdges.length === 0) {
      // End node or disconnected — no nextSteps
    } else if (outEdges.length === 1 && (!outEdges[0].sourceHandle || outEdges[0].sourceHandle === 'source')) {
      // Simple node → single "default" next step
      const targetIndex = globalNodeIndexMap.get(outEdges[0].target);
      if (targetIndex !== undefined) {
        nextSteps['default'] = targetIndex;
      }
    } else {
      // Multi-output: resolve each handle to its 1-based integer index
      outEdges.forEach(edge => {
        let routeIndex: number | string = 0;

        if (d.answers?.length && edge.sourceHandle) {
          const idx = d.answers.findIndex((a: any, i: number) => (a.id || `ans_${i}`) === edge.sourceHandle);
          if (idx >= 0) {
            routeIndex = Number(d.answers[idx].aIndex) || (idx + 1);
          }
        } else if (d.buttons?.length && edge.sourceHandle) {
          const idx = d.buttons.findIndex((b: any) => b.id === edge.sourceHandle);
          if (idx >= 0) routeIndex = idx + 1;
        } else if (d.cases?.length && edge.sourceHandle && edge.sourceHandle !== 'default') {
          const idx = d.cases.findIndex((c: any) => c.id === edge.sourceHandle);
          if (idx >= 0) routeIndex = idx + 1;
        } else if (edge.sourceHandle === 'default') {
          routeIndex = 'default';
        } else if (d.nodeType === 'condition' && d.conditionType !== 'switch') {
          // Condition: 1 = yes (true), 2 = no (false)
          routeIndex = edge.sourceHandle === 'yes' ? 1 : 2;
          // Ensure the config tells the backend what 1 and 2 mean
          if (!config.conditionMapping) {
            config.conditionMapping = { "1": "yes", "2": "no" };
          }
        }

        const targetIndex = globalNodeIndexMap.get(edge.target);
        if (targetIndex !== undefined) {
          nextSteps[String(routeIndex)] = targetIndex;
        }
      });
    }

    steps.push({
      id: globalNodeIndexMap.get(node.id)!,
      type: d.nodeType,
      name: d.label,
      config,
      nextSteps,
    });
  });

  return steps;
}
