import { v4 as uuidv4 } from 'uuid';
import { MarkerType } from 'reactflow';
import type { FlowNode, FlowEdge, FlowNodeData } from '../types';
import { NODE_LIBRARY } from '../constants/nodeLibrary';

// ─────────────────────────────────────────────────────────────
// JSON → Flow Builder importer
// Supports two formats:
//   1. Internal format: { nodes, edges } (round-trip from export)
//   2. Prompts format: { prompts } (external / senior-engineer schema)
// ─────────────────────────────────────────────────────────────

/** Detection: figure out what kind of JSON the user pasted */
export function detectJsonFormat(json: any): 'internal' | 'prompts' | 'unknown' {
  if (json.nodes && Array.isArray(json.nodes) && json.nodes.length > 0) {
    const first = json.nodes[0];
    if (first.id && first.position && first.data) return 'internal';
  }
  if (json.prompts && Array.isArray(json.prompts) && json.prompts.length > 0) {
    const first = json.prompts[0];
    if (first.pIndex !== undefined || first.text !== undefined || first.props) return 'prompts';
  }
  return 'unknown';
}

/** Convert internal format to loadable doc (nodes + edges already present) */
export function importInternalFormat(json: any) {
  return {
    flowId: json.flowId || uuidv4(),
    name: json.name || 'Imported Flow',
    version: json.version || 1,
    status: json.status || 'draft',
    nodes: json.nodes,
    edges: json.edges || [],
    variables: json.variables || {},
  };
}

// ─── NODE TYPE INFERENCE ───
// Multi-signal detection: key prefix > description > props > fallback
function inferNodeType(prompt: any): string {
  const props: string[] = prompt.props || [];
  const propsUpper = props.map((p: string) => p.toUpperCase());
  const key = (prompt.key || '').toLowerCase();
  const desc = (prompt.description || '').toLowerCase();

  // ── 1. TRIGGER — always explicit ──
  if (propsUpper.includes('TRIGGER')) return 'trigger';
  if (key.startsWith('trigger_')) return 'trigger';

  // ── 2. Key prefix (most reliable from our own export format) ──
  if (key.startsWith('text_')) return 'text';
  if (key.startsWith('end_')) return 'end';
  if (key.startsWith('delay_')) return 'delay';
  if (key.startsWith('condition_')) return 'condition';
  if (key.startsWith('httprequest_') || key.startsWith('api_')) return 'httpRequest';
  if (key.startsWith('getinput_')) return 'getInput';
  if (key.startsWith('card_')) return 'card';
  if (key.startsWith('sendemail_')) return 'sendEmail';
  if (key.startsWith('notification_')) return 'notification';
  if (key.startsWith('dbsave_')) return 'dbSave';

  // ── 3. Description matching (from our node library defaults) ──
  if (desc.includes('send a simple text message')) return 'text';
  if (desc.includes('terminate the flow')) return 'end';
  if (desc.includes('wait before next step')) return 'delay';
  if (desc.includes('make http request') || desc.includes('external api')) return 'httpRequest';
  if (desc.includes('collect image') || desc.includes('collect video')) return 'getInput';
  if (desc.includes('rich card with buttons')) return 'card';

  // ── 4. Props-based for clear types ──
  if (propsUpper.includes('SINGLE_CHOICE') || propsUpper.includes('MULTI_CHOICE')) return 'questionnaire';
  if (propsUpper.includes('ENDING')) return 'questionnaire'; // ENDING stays as questionnaire
  if (propsUpper.includes('CONDITION') || propsUpper.includes('SWITCH')) return 'condition';
  if (propsUpper.includes('DELAY')) return 'delay';
  if (propsUpper.includes('HTTP') || propsUpper.includes('API')) return 'httpRequest';
  if (propsUpper.includes('GET_INPUT') || propsUpper.includes('MEDIA_INPUT')) return 'getInput';
  if (propsUpper.includes('CARD')) return 'card';
  if (propsUpper.includes('END')) return 'end';

  // ── 5. TEXT prop disambiguation ──
  // Both text messages and questionnaire text inputs have props: ["TEXT"]
  // Differentiate by: variableName (questionnaire), key prefix, description
  if (propsUpper.includes('TEXT')) {
    // Has variableName → it's a questionnaire asking for text input
    if (prompt.variableName) return 'questionnaire';
    // Key starts with questionnaire_ → questionnaire
    if (key.startsWith('questionnaire_')) return 'questionnaire';
    // Description says "Ask questions" → questionnaire
    if (desc.includes('ask question')) return 'questionnaire';
    // Otherwise → plain text message
    return 'text';
  }

  // ── 6. Has answers → questionnaire ──
  if (prompt.answers && prompt.answers.length > 0) return 'questionnaire';

  // ── 7. Fallback ──
  return 'questionnaire';
}

// ─── BFS TREE LAYOUT ───
// Layout nodes in a tree/waterfall pattern based on connections
function computeTreeLayout(prompts: any[]): Map<number, { x: number; y: number }> {
  const positions = new Map<number, { x: number; y: number }>();
  const NODE_W = 340;
  const NODE_H = 220;
  const H_GAP = 60;
  const V_GAP = 80;

  // Build adjacency: pIndex → children pIndices
  const children = new Map<number, number[]>();
  const allIndices = new Set<number>();
  const hasParent = new Set<number>();

  prompts.forEach(p => {
    const pIdx = p.pIndex ?? 0;
    allIndices.add(pIdx);
    const kids: number[] = [];

    // Single next
    if (p.nextPIndex !== null && p.nextPIndex !== undefined) {
      kids.push(p.nextPIndex);
      hasParent.add(p.nextPIndex);
    }
    // Answer-based routing
    if (p.answers && p.answers.length > 0) {
      p.answers.forEach((a: any) => {
        if (a.nextPIndex !== null && a.nextPIndex !== undefined) {
          kids.push(a.nextPIndex);
          hasParent.add(a.nextPIndex);
        }
      });
    }

    // Deduplicate children
    children.set(pIdx, [...new Set(kids)]);
  });

  // Find root(s) — nodes with no parent
  const roots: number[] = [];
  allIndices.forEach(idx => {
    if (!hasParent.has(idx)) roots.push(idx);
  });
  if (roots.length === 0 && allIndices.size > 0) {
    roots.push(Math.min(...allIndices));
  }

  // BFS to assign layers (depth) and horizontal slots
  const depth = new Map<number, number>();
  const visited = new Set<number>();
  const layerNodes = new Map<number, number[]>(); // depth → [pIndex, ...]

  const queue: number[] = [...roots];
  roots.forEach(r => depth.set(r, 0));

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const d = depth.get(current) ?? 0;
    if (!layerNodes.has(d)) layerNodes.set(d, []);
    layerNodes.get(d)!.push(current);

    const kids = children.get(current) || [];
    kids.forEach(kid => {
      if (!visited.has(kid) && !depth.has(kid)) {
        depth.set(kid, d + 1);
        queue.push(kid);
      }
    });
  }

  // Add orphan nodes not reached by BFS
  allIndices.forEach(idx => {
    if (!visited.has(idx)) {
      const maxDepth = Math.max(0, ...Array.from(layerNodes.keys()));
      const orphanDepth = maxDepth + 1;
      depth.set(idx, orphanDepth);
      if (!layerNodes.has(orphanDepth)) layerNodes.set(orphanDepth, []);
      layerNodes.get(orphanDepth)!.push(idx);
    }
  });

  // Assign positions: center each layer horizontally
  const sortedDepths = Array.from(layerNodes.keys()).sort((a, b) => a - b);
  sortedDepths.forEach(d => {
    const nodesInLayer = layerNodes.get(d) || [];
    const totalWidth = nodesInLayer.length * (NODE_W + H_GAP) - H_GAP;
    const startX = -totalWidth / 2;

    nodesInLayer.forEach((pIdx, i) => {
      positions.set(pIdx, {
        x: startX + i * (NODE_W + H_GAP) + 400, // offset to keep in positive space
        y: d * (NODE_H + V_GAP) + 80,
      });
    });
  });

  return positions;
}

/** Convert prompts-based JSON into visual nodes + edges */
export function importPromptsFormat(json: any): {
  flowId: string;
  name: string;
  version: number;
  status: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: Record<string, any>;
} {
  const prompts: any[] = json.prompts || [];
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  // Compute tree layout
  const layoutPositions = computeTreeLayout(prompts);

  // Map pIndex → nodeId for edge wiring
  const pIndexToNodeId = new Map<number, string>();

  // ─── PASS 1: Create nodes ───
  prompts.forEach((prompt, idx) => {
    const pIndex = prompt.pIndex ?? idx;
    const nodeType = inferNodeType(prompt);
    const libItem = NODE_LIBRARY.find(n => n.type === nodeType);

    const position = layoutPositions.get(pIndex) || { x: 100 + (idx % 3) * 400, y: 100 + Math.floor(idx / 3) * 260 };

    const nodeId = `${nodeType}_${uuidv4().slice(0, 8)}`;
    pIndexToNodeId.set(pIndex, nodeId);

    // Build node data based on type
    const baseData: any = {
      ...(libItem?.defaultData || {}),
      label: prompt.label || prompt.key || libItem?.label || `Prompt ${pIndex}`,
      nodeType,
      category: libItem?.category || 'message',
      icon: libItem?.icon || '📋',
      isConfigured: true,
      hasError: false,
    };

    // Populate type-specific fields
    if (nodeType === 'questionnaire') {
      baseData.text = prompt.text || '';
      baseData.language = prompt.language || 'ENGLISH';
      baseData.promptKey = prompt.key || `questionnaire_${idx + 1}`;
      baseData.promptProps = prompt.props || ['SINGLE_CHOICE'];
      baseData.label = prompt.label || prompt.key || 'Prompt';

      // Copy questionnaire-specific fields
      if (prompt.variableName) baseData.variableName = prompt.variableName;
      if (prompt.inputFormat) baseData.inputFormat = prompt.inputFormat;
      if (prompt.inputType) baseData.inputType = prompt.inputType;

      // Build answers with proper IDs
      if (prompt.answers && prompt.answers.length > 0) {
        baseData.answers = prompt.answers.map((ans: any, aIdx: number) => ({
          id: `ans_${uuidv4().slice(0, 6)}`,
          aIndex: ans.aIndex ?? (aIdx + 1),
          text: ans.text || `Option ${aIdx + 1}`,
          value: ans.key || undefined,
          props: ans.props || ['BUTTON'],
        }));

        // Detect input format from answer props
        const firstProps = prompt.answers[0]?.props || [];
        if (firstProps.length > 0) {
          const fmt = firstProps[0]?.toUpperCase();
          if (['BUTTON', 'RADIO', 'CHECKBOX', 'DROPDOWN', 'LIST'].includes(fmt)) {
            baseData.inputFormat = fmt.toLowerCase();
          }
        }
      } else {
        baseData.answers = [];
      }

    } else if (nodeType === 'trigger') {
      baseData.label = prompt.label || prompt.text || 'Flow Start';
      baseData.description = prompt.description || 'Entry point — your flow starts here';
      if (prompt.triggerType) baseData.triggerType = prompt.triggerType;
      if (prompt.config) baseData.config = prompt.config;

    } else if (nodeType === 'end') {
      baseData.label = prompt.label || prompt.text || 'End';
      baseData.endType = 'complete';

    } else if (nodeType === 'text') {
      baseData.message = prompt.text || '';
      baseData.label = prompt.label || prompt.key || 'Text Message';

    } else if (nodeType === 'delay') {
      baseData.duration = prompt.duration || 5;
      baseData.unit = prompt.unit || 'seconds';
      baseData.label = prompt.label || 'Delay';

    } else if (nodeType === 'condition') {
      baseData.conditionType = prompt.conditionType || 'rules';
      baseData.variable = prompt.variable || '';
      baseData.label = prompt.label || 'Condition';

    } else {
      // Generic: store text/message
      if (prompt.text) baseData.text = prompt.text;
      if (prompt.message) baseData.message = prompt.message;
      baseData.label = prompt.label || prompt.key || libItem?.label || 'Node';
    }

    // Copy over any extra fields not already handled
    const handledKeys = new Set([
      'pIndex', 'key', 'language', 'text', 'props', 'answers',
      'nextPIndex', 'prevPIndex', 'description', 'nodeType',
      'config', 'message', 'duration', 'unit', 'conditionType', 'variable',
      'label', 'variableName', 'inputFormat', 'inputType', 'triggerType',
    ]);
    for (const [k, v] of Object.entries(prompt)) {
      if (!handledKeys.has(k) && v !== undefined && v !== null) {
        baseData[k] = v;
      }
    }

    const node: FlowNode = {
      id: nodeId,
      type: nodeType,
      position,
      data: baseData as FlowNodeData,
    };

    nodes.push(node);
  });

  // ─── PASS 2: Create edges ───
  prompts.forEach((prompt, idx) => {
    const pIndex = prompt.pIndex ?? idx;
    const sourceNodeId = pIndexToNodeId.get(pIndex);
    if (!sourceNodeId) return;

    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;

    // Handle answer-based routing (each answer → different target)
    if (prompt.answers && prompt.answers.length > 0) {
      const nodeData = sourceNode.data as any;

      prompt.answers.forEach((ans: any, aIdx: number) => {
        if (ans.nextPIndex === null || ans.nextPIndex === undefined) return;

        const targetNodeId = pIndexToNodeId.get(ans.nextPIndex);
        if (!targetNodeId) return;

        const answerId = nodeData.answers?.[aIdx]?.id;
        if (!answerId) return;

        const edge: FlowEdge = {
          id: `edge_${uuidv4().slice(0, 8)}`,
          source: sourceNodeId,
          target: targetNodeId,
          sourceHandle: answerId,
          targetHandle: 'target',
          type: 'labeled',
          animated: true,
          label: ans.text || `Option ${aIdx + 1}`,
          data: { sourceAnswerLabel: ans.text },
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
          style: { strokeWidth: 2 },
        };

        edges.push(edge);
      });
    }

    // Handle single nextPIndex routing (no answers, or answers already processed)
    if (
      prompt.nextPIndex !== null &&
      prompt.nextPIndex !== undefined &&
      (!prompt.answers || prompt.answers.length === 0)
    ) {
      const targetNodeId = pIndexToNodeId.get(prompt.nextPIndex);
      if (targetNodeId) {
        const edge: FlowEdge = {
          id: `edge_${uuidv4().slice(0, 8)}`,
          source: sourceNodeId,
          target: targetNodeId,
          sourceHandle: 'source',
          targetHandle: 'target',
          type: 'labeled',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
          style: { strokeWidth: 2 },
        };

        edges.push(edge);
      }
    }
  });

  return {
    flowId: json.flowId || uuidv4(),
    name: json.name || 'Imported Flow',
    version: json.version || 1,
    status: json.status || 'draft',
    nodes,
    edges,
    variables: json.variables || {},
  };
}

/** Main entry point: detect format and convert */
export function importJsonToFlow(jsonString: string): {
  success: boolean;
  doc?: any;
  error?: string;
  format?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    const format = detectJsonFormat(parsed);

    switch (format) {
      case 'internal': {
        const doc = importInternalFormat(parsed);
        return { success: true, doc, format: 'internal' };
      }
      case 'prompts': {
        const doc = importPromptsFormat(parsed);
        return { success: true, doc, format: 'prompts' };
      }
      default:
        return {
          success: false,
          error: 'Unrecognized JSON format. Expected either { nodes, edges } or { prompts } structure.',
        };
    }
  } catch (err: any) {
    return {
      success: false,
      error: `Invalid JSON: ${err.message}`,
    };
  }
}
