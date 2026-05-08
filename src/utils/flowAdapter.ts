import type { FlowNode, FlowEdge, QuestionnaireNodeData } from '../types';

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

  // Build nodeId → global step index lookup (0-based) to match the steps array
  const stepNodes = nodes.filter(n => n.data.nodeType !== 'notes');
  const globalNodeIndexMap = new Map<string, number>();
  stepNodes.forEach((node, i) => {
    globalNodeIndexMap.set(node.id, i);
  });

  // Get questionnaire nodes sorted by Y position (top to bottom)
  const qNodes = nodes
    .filter(n => n.type === 'questionnaire')
    .sort((a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0));

  qNodes.forEach((node, i) => {
    const data = node.data as QuestionnaireNodeData;
    const d = data as any;

    const type = Array.isArray(data.promptProps)
      ? data.promptProps
      : (data.promptProps ? [data.promptProps] : ['SINGLE_CHOICE']);

    const isTextInput = type.includes('TEXT');
    const isEnding = type.includes('ENDING');
    const inputFormat = (d.inputFormat || 'BUTTON').toUpperCase();

    // Build prompt object matching the exact requested JSON payload
    const prompt: any = {
      pIndex: i,
      key: data.promptKey || `prompt_${i}`,
      language: data.language || 'ENGLISH',
      text: data.text || '',
      props: type,
    };

    if (isTextInput) {
      // TEXT mode: no predefined answers, but keep variable mappings
      if (d.variableName) prompt.saveToVariable = d.variableName;
      if (d.inputType) prompt.expectedInputType = d.inputType;

      // Resolve next from default edge
      const edge = edges.find(e => e.source === node.id);
      let nextPIndex = 99;
      let nextPromptLanguage = data.language || 'ENGLISH';

      if (edge) {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode) {
          nextPIndex = globalNodeIndexMap.get(targetNode.id) ?? 99;
          nextPromptLanguage = (targetNode.data as any).language || 'ENGLISH';
        }
      }
      
      prompt.answers = [];
    } else if (isEnding) {
      prompt.answers = [];
    } else {
      // Choice mode: map answers with routing
      prompt.answers = (data.answers || []).map((ans, ansIdx) => {
        const edge = edges.find(e => e.source === node.id && e.sourceHandle === ans.id);
        let nextPIndex = 99;
        let nextPromptLanguage = data.language || 'ENGLISH';

        if (edge) {
          const targetNode = nodes.find(n => n.id === edge.target);
          if (targetNode) {
            nextPIndex = globalNodeIndexMap.get(targetNode.id) ?? 99;
            nextPromptLanguage = (targetNode.data as any).language || 'ENGLISH';
          }
        }

        const aIndex = ans.aIndex || (ansIdx + 1);

        return {
          aIndex,
          keyPattern: String(aIndex),
          keyPatternHuman: String(aIndex),
          text: ans.text,
          props: [inputFormat],
          nextPromptLanguage,
          nextPIndex,
        };
      });
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
      'isConfigured', 'hasError', 'errorMessage', 'description',
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
        config.answers = (value as any[]).map((a, i) => ({
          index: i + 1,
          text: a.text,
        }));

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
          const idx = d.answers.findIndex((a: any) => a.id === edge.sourceHandle);
          if (idx >= 0) {
            routeIndex = Number(d.answers[idx].aIndex) || (idx + 1);
          }
        } else if (d.buttons?.length && edge.sourceHandle) {
          const idx = d.buttons.findIndex((b: any) => b.id === edge.sourceHandle);
          if (idx >= 0) routeIndex = idx + 1;
        } else if (d.cases?.length && edge.sourceHandle) {
          const idx = d.cases.findIndex((c: any) => c.id === edge.sourceHandle);
          if (idx >= 0) routeIndex = idx + 1;
        } else if (d.nodeType === 'condition') {
          // Condition: 1 = yes (true), 2 = no (false)
          routeIndex = edge.sourceHandle === 'yes' ? 1 : 2;
          // Ensure the config tells the backend what 1 and 2 mean
          if (!config.conditionMapping) {
            config.conditionMapping = { "1": "yes", "2": "no" };
          }
        } else if (edge.sourceHandle === 'default') {
          routeIndex = 'default';
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
