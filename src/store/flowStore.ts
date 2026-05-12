import {
    applyEdgeChanges,
    applyNodeChanges,
    type Connection,
    type EdgeChange,
    MarkerType,
    type NodeChange,
    addEdge as rfAddEdge,
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { NODE_LIBRARY } from '../constants';
import { isNodeConfigured } from '../config';
import { flowToPrompts, flowToSteps } from '../utils/flowAdapter';
import type {
    FlowDocument,
    FlowEdge,
    FlowNode,
    FlowNodeData,
    FlowNodeType,
    FlowVariable,
    HistoryEntry,
    ValidationError,
} from '../types';

// ─── History size limit ───
const MAX_HISTORY = 50;

interface FlowState {
  // ─── Flow Data ───
  flowId: string;
  flowName: string;
  flowStatus: 'draft' | 'published' | 'archived';
  flowVersion: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: Record<string, FlowVariable>;

  // ─── UI State ───
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isDirty: boolean;
  lastSaved: string | null;
  darkMode: boolean;
  showMinimap: boolean;
  showDebugPanel: boolean;
  showJsonPreview: boolean;
  searchQuery: string;
  sidebarCollapsed: boolean;
  rightPanelCollapsed: boolean;

  // ─── History ───
  history: HistoryEntry[];
  historyIndex: number;

  // ─── Validation ───
  validationErrors: ValidationError[];

  // ─── Actions: Nodes ───
  addNode: (type: FlowNodeType, position: { x: number; y: number }) => string;
  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  selectNode: (nodeId: string | null) => void;

  // ─── Actions: Edges ───
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  deleteEdge: (edgeId: string) => void;
  updateEdge: (edgeId: string, patch: Partial<FlowEdge>) => void;
  selectEdge: (edgeId: string | null) => void;

  // ─── Actions: Flow ───
  setFlowName: (name: string) => void;
  setFlowStatus: (status: 'draft' | 'published' | 'archived') => void;
  saveFlow: () => void;
  loadFlow: (doc: FlowDocument) => void;
  exportFlow: () => FlowDocument;
  clearFlow: () => void;

  // ─── Actions: History ───
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // ─── Actions: Validation ───
  validateFlow: () => ValidationError[];

  // ─── Actions: UI ───
  toggleDarkMode: () => void;
  toggleMinimap: () => void;
  toggleDebugPanel: () => void;
  toggleJsonPreview: () => void;
  setSearchQuery: (q: string) => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;

  // ─── Actions: Variables ───
  addVariable: (variable: FlowVariable) => void;
  removeVariable: (name: string) => void;
  getAncestorVariables: (nodeId: string) => string[];
}

// ─── Default trigger node for new flows ───
const defaultTriggerNode: FlowNode = {
  id: 'trigger_1',
  type: 'trigger',
  position: { x: 250, y: 100 },
  data: {
    label: 'Flow Start',
    nodeType: 'trigger',
    category: 'trigger',
    icon: '⚡',
    isConfigured: true,
    hasError: false,
    description: 'Entry point — your flow starts here',
  } as FlowNodeData,
};

export const useFlowStore = create<FlowState>()(
  subscribeWithSelector((set, get) => ({
    // ─── Initial State ───
    flowId: uuidv4(),
    flowName: 'Untitled Flow',
    flowStatus: 'draft',
    flowVersion: 1,
    nodes: [defaultTriggerNode],
    edges: [],
    variables: {},

    selectedNodeId: null,
    selectedEdgeId: null,
    isDirty: false,
    lastSaved: null,
    darkMode: false,
    showMinimap: true,
    showDebugPanel: false,
    showJsonPreview: false,
    searchQuery: '',
    sidebarCollapsed: false,
    rightPanelCollapsed: true,

    history: [],
    historyIndex: -1,

    validationErrors: [],

    // ─── Node Actions ───
    addNode: (type, position) => {
      const state = get();
      state.pushHistory();

      const libraryItem = NODE_LIBRARY.find((n) => n.type === type);
      if (!libraryItem) return '';

      const existingCount = state.nodes.filter(n => n.type === type).length;
      const typeIndex = existingCount + 1;

      const nodeId = `${type}_${uuidv4().slice(0, 8)}`;
      const nodeData = JSON.parse(JSON.stringify({
          ...libraryItem.defaultData,
          label: libraryItem.label,
          nodeType: type,
          category: libraryItem.category,
          icon: libraryItem.icon,
          hasError: false,
          promptKey: `${type}_${typeIndex}`,
        })) as FlowNodeData;
      // Auto-check configuration using schema
      (nodeData as any).isConfigured = isNodeConfigured(type, nodeData as any);

      // Generate unique IDs for buttons/answers so handles don't collide
      const d = nodeData as any;
      if (d.buttons) {
        d.buttons = d.buttons.map((b: any) => ({ ...b, id: `btn_${uuidv4().slice(0, 6)}` }));
      }
      if (d.answers) {
        d.answers = d.answers.map((a: any) => ({ ...a, id: `ans_${uuidv4().slice(0, 6)}` }));
      }
      if (d.cases) {
        d.cases = d.cases.map((c: any) => ({ ...c, id: `case_${uuidv4().slice(0, 6)}` }));
      }

      const newNode: FlowNode = {
        id: nodeId,
        type: type,
        position,
        data: nodeData,
      };

      set({
        nodes: [...state.nodes, newNode],
        isDirty: true,
        selectedNodeId: nodeId,
        rightPanelCollapsed: false,
      });

      return nodeId;
    },

    updateNodeData: (nodeId, data) => {
      const state = get();
      state.pushHistory();

      let updatedEdges = state.edges;

      set({
        nodes: state.nodes.map((n) => {
          if (n.id !== nodeId) return n;
          const merged = { ...n.data, ...data } as FlowNodeData;

          // Ensure promptProps is always an array (select gives a string)
          const m = merged as any;
          if (m.promptProps && typeof m.promptProps === 'string') {
            m.promptProps = [m.promptProps];
          }

          // Ensure answer props are always arrays
          if (m.answers) {
            m.answers = m.answers.map((a: any) => ({
              ...a,
              props: typeof a.props === 'string' ? [a.props] : (a.props || ['BUTTON']),
            }));
          }

          // ─── Sync edge labels when answers/buttons/cases are renamed ───
          const dynamicItems: { id: string; label: string }[] = [];
          if (m.answers?.length) {
            m.answers.forEach((a: any) => dynamicItems.push({ id: a.id, label: a.text }));
          } else if (m.buttons?.length) {
            m.buttons.forEach((b: any) => dynamicItems.push({ id: b.id, label: b.label }));
          } else if (m.cases?.length) {
            m.cases.forEach((c: any) => dynamicItems.push({ id: c.id, label: c.label || c.value }));
          }
          if (dynamicItems.length > 0) {
            updatedEdges = updatedEdges.map(e => {
              if (e.source !== nodeId) return e;
              const matchItem = dynamicItems.find(item => item.id === e.sourceHandle);
              if (matchItem && matchItem.label) {
                return {
                  ...e,
                  label: matchItem.label,
                  data: { ...e.data, sourceAnswerLabel: matchItem.label },
                };
              }
              return e;
            });
          }

          // Auto-recheck configuration status using schema
          m.isConfigured = isNodeConfigured(merged.nodeType, m);
          return { ...n, data: merged };
        }),
        edges: updatedEdges,
        isDirty: true,
      });
    },

    deleteNode: (nodeId) => {
      const state = get();
      if (nodeId === 'trigger_1') return; // Can't delete the trigger
      state.pushHistory();

      set({
        nodes: state.nodes.filter((n) => n.id !== nodeId),
        edges: state.edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        ),
        selectedNodeId:
          state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        isDirty: true,
        rightPanelCollapsed: state.selectedNodeId === nodeId ? true : state.rightPanelCollapsed,
      });
    },

    duplicateNode: (nodeId) => {
      const state = get();
      const node = state.nodes.find((n) => n.id === nodeId);
      if (!node || node.data.nodeType === 'trigger') return;
      state.pushHistory();

      const newId = `${node.data.nodeType}_${uuidv4().slice(0, 8)}`;
      const newNode: FlowNode = {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 40,
          y: node.position.y + 40,
        },
        selected: false,
        data: { ...node.data } as FlowNodeData,
      };

      set({
        nodes: [...state.nodes, newNode],
        selectedNodeId: newId,
        isDirty: true,
      });
    },

    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes) as FlowNode[],
        isDirty: true,
      });
    },

    selectNode: (nodeId) => {
      set({
        selectedNodeId: nodeId,
        selectedEdgeId: null,
        rightPanelCollapsed: nodeId === null,
      });
    },

    // ─── Edge Actions ───
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
        isDirty: true,
      });
    },

    onConnect: (connection) => {
      const state = get();
      state.pushHistory();

      // Validation: prevent self-connections
      if (connection.source === connection.target) return;

      // Replace existing edge from same source handle (switch-case: each button → one path)
      const cleanedEdges = state.edges.filter(
        (e) => !(e.source === connection.source && e.sourceHandle === connection.sourceHandle)
      );

      // ─── Resolve label from source node's dynamic outputs ───
      let edgeLabel = '';
      const sourceNode = state.nodes.find(n => n.id === connection.source);
      if (sourceNode && connection.sourceHandle && connection.sourceHandle !== 'source') {
        const d = sourceNode.data as any;
        // Questionnaire answers
        if (d.answers?.length) {
          const match = d.answers.find((a: any, i: number) => (a.id || `ans_${i}`) === connection.sourceHandle);
          if (match) edgeLabel = match.text;
        }
        // Button node
        if (!edgeLabel && d.buttons?.length) {
          const match = d.buttons.find((b: any) => b.id === connection.sourceHandle);
          if (match) edgeLabel = match.label;
        }
        // Switch cases
        if (!edgeLabel && d.cases?.length) {
          const match = d.cases.find((c: any) => c.id === connection.sourceHandle);
          if (match) edgeLabel = match.label || match.value;
        }
        // Condition yes/no
        if (!edgeLabel && d.nodeType === 'condition') {
          if (connection.sourceHandle === 'yes') edgeLabel = 'Yes';
          if (connection.sourceHandle === 'no') edgeLabel = 'No';
        }
        // Default handle id for switch
        if (!edgeLabel && connection.sourceHandle === 'default') {
          edgeLabel = 'Default';
        }
      }

      const newEdge = {
        ...connection,
        id: `edge_${uuidv4().slice(0, 8)}`,
        type: 'labeled',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { strokeWidth: 2 },
        label: edgeLabel || undefined,
        data: edgeLabel ? { sourceAnswerLabel: edgeLabel } : undefined,
      };

      // ─── Auto-fill Condition/Switch variables or Text placeholders ───
      let updatedNodes = state.nodes;
      const targetNode = state.nodes.find(n => n.id === connection.target);
      if (sourceNode && targetNode) {
        const sData = sourceNode.data as any;
        // Check standard variable keys used in various nodes
        const savedVar = sData.variableName || sData.responseVariable || sData.saveToVariable;
        
        if (savedVar) {
          const tData = { ...targetNode.data } as any;
          let changed = false;
          
          if (targetNode.type === 'condition') {
            if (tData.conditionType === 'switch') {
              if (!tData.variable) {
                tData.variable = savedVar;
                changed = true;
              }
            } else {
              if (!tData.rules || tData.rules.length === 0) {
                tData.rules = [{ id: `rule_${uuidv4().slice(0, 6)}`, field: savedVar, operator: 'equals', value: '' }];
                changed = true;
              } else if (!tData.rules[0].field) {
                tData.rules[0].field = savedVar;
                changed = true;
              }
            }
          } else if (targetNode.type === 'text' || targetNode.type === 'questionnaire' || targetNode.type === 'getInput') {
            const textField = targetNode.type === 'questionnaire' ? 'text' : 'message';
            if (!tData[textField] || tData[textField].trim() === '') {
              const prefix = targetNode.type === 'text' ? 'Here is the ' : 'Please provide the ';
              tData[textField] = `${prefix}{{${savedVar}}}`;
              changed = true;
            }
          }
          
          if (changed) {
            updatedNodes = state.nodes.map(n => 
              n.id === targetNode.id ? { ...n, data: tData } : n
            );
          }
        }
      }

      set({
        nodes: updatedNodes,
        edges: rfAddEdge(newEdge, cleanedEdges),
        isDirty: true,
      });
    },

    deleteEdge: (edgeId) => {
      const state = get();
      state.pushHistory();

      set({
        edges: state.edges.filter((e) => e.id !== edgeId),
        selectedEdgeId:
          state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
        isDirty: true,
      });
    },

    updateEdge: (edgeId, patch) => {
      const state = get();
      const edge = state.edges.find((e) => e.id === edgeId);
      if (!edge) return;

      const nextSource = patch.source ?? edge.source;
      const nextTarget = patch.target ?? edge.target;
      if (nextSource === nextTarget) return;

      const duplicate = state.edges.some(
        (e) =>
          e.id !== edgeId &&
          e.source === nextSource &&
          e.target === nextTarget &&
          e.sourceHandle === (patch.sourceHandle ?? edge.sourceHandle) &&
          e.targetHandle === (patch.targetHandle ?? edge.targetHandle)
      );
      if (duplicate) return;

      state.pushHistory();

      set({
        edges: state.edges.map((e) =>
          e.id === edgeId ? { ...e, ...patch } : e
        ),
        isDirty: true,
      });
    },

    selectEdge: (edgeId) => {
      set({
        selectedEdgeId: edgeId,
        selectedNodeId: null,
      });
    },

    // ─── Flow Actions ───
    setFlowName: (name) => set({ flowName: name, isDirty: true }),
    setFlowStatus: (status) => set({ flowStatus: status, isDirty: true }),

    saveFlow: () => {
      const now = new Date().toISOString();
      set({ isDirty: false, lastSaved: now });
      // Save internal format (nodes/edges) to localStorage
      const state = get();
      const doc = {
        flowId: state.flowId,
        name: state.flowName,
        version: state.flowVersion,
        status: state.flowStatus,
        nodes: state.nodes,
        edges: state.edges,
        variables: state.variables,
        metadata: { createdAt: now, updatedAt: now },
      };
      localStorage.setItem('flowcraft_current_flow', JSON.stringify(doc));
    },

    loadFlow: (doc: any) => {
      // ─── Auto-resolve edge labels for backward compatibility ───
      const nodes = doc.nodes || [];
      const rawEdges = doc.edges || [];
      const labeledEdges = rawEdges.map((edge: any) => {
        // Upgrade old edge types to labeled
        const upgraded = { ...edge, type: 'labeled' };

        // Skip if already has a label or no sourceHandle
        if (upgraded.label || !upgraded.sourceHandle || upgraded.sourceHandle === 'source') {
          return upgraded;
        }

        // Find source node and resolve the label
        const srcNode = nodes.find((n: any) => n.id === upgraded.source);
        if (!srcNode) return upgraded;

        const d = srcNode.data as any;
        let resolvedLabel = '';

        if (d.answers?.length) {
          const match = d.answers.find((a: any) => a.id === upgraded.sourceHandle);
          if (match) resolvedLabel = match.text;
        }
        if (!resolvedLabel && d.buttons?.length) {
          const match = d.buttons.find((b: any) => b.id === upgraded.sourceHandle);
          if (match) resolvedLabel = match.label;
        }
        if (!resolvedLabel && d.cases?.length) {
          const match = d.cases.find((c: any) => c.id === upgraded.sourceHandle);
          if (match) resolvedLabel = match.label || match.value;
        }
        if (!resolvedLabel && d.nodeType === 'condition') {
          if (upgraded.sourceHandle === 'yes') resolvedLabel = 'Yes';
          if (upgraded.sourceHandle === 'no') resolvedLabel = 'No';
        }
        if (!resolvedLabel && upgraded.sourceHandle === 'default') {
          resolvedLabel = 'Default';
        }

        if (resolvedLabel) {
          upgraded.label = resolvedLabel;
          upgraded.data = { ...upgraded.data, sourceAnswerLabel: resolvedLabel };
        }

        return upgraded;
      });

      set({
        flowId: doc.flowId || uuidv4(),
        flowName: doc.name || 'Untitled Flow',
        flowStatus: doc.status || 'draft',
        flowVersion: doc.version || 1,
        nodes,
        edges: labeledEdges,
        variables: doc.variables || {},
        isDirty: false,
        selectedNodeId: null,
        history: [],
        historyIndex: -1,
      });
    },

    exportFlow: () => {
      const state = get();
      return {
        flowId: state.flowId,
        name: state.flowName,
        version: state.flowVersion,
        status: state.flowStatus,
        // Internal format for saving/loading
        nodes: state.nodes,
        edges: state.edges,
        // Senior engineer format (questionnaire only)
        prompts: flowToPrompts(state.nodes, state.edges),
        // Generic routing map (ALL node types)
        // steps: flowToSteps(state.nodes, state.edges),
        variables: state.variables,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    },

    clearFlow: () => {
      set({
        flowId: uuidv4(),
        flowName: 'Untitled Flow',
        flowStatus: 'draft',
        flowVersion: 1,
        nodes: [defaultTriggerNode],
        edges: [],
        variables: {},
        selectedNodeId: null,
        isDirty: false,
        history: [],
        historyIndex: -1,
        validationErrors: [],
      });
    },

    // ─── History Actions ───
    pushHistory: () => {
      const state = get();
      const entry: HistoryEntry = {
        nodes: JSON.parse(JSON.stringify(state.nodes)),
        edges: JSON.parse(JSON.stringify(state.edges)),
        timestamp: Date.now(),
      };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(entry);

      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }

      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    },

    undo: () => {
      const state = get();
      if (state.historyIndex < 0) return;

      const entry = state.history[state.historyIndex];
      set({
        nodes: JSON.parse(JSON.stringify(entry.nodes)),
        edges: JSON.parse(JSON.stringify(entry.edges)),
        historyIndex: state.historyIndex - 1,
        isDirty: true,
      });
    },

    redo: () => {
      const state = get();
      if (state.historyIndex >= state.history.length - 1) return;

      const nextIndex = state.historyIndex + 1;
      // For redo, we need to go forward; since pushHistory saves the state BEFORE the action,
      // we need to check if there's a state after the current index
      if (nextIndex + 1 < state.history.length) {
        const entry = state.history[nextIndex + 1];
        set({
          nodes: JSON.parse(JSON.stringify(entry.nodes)),
          edges: JSON.parse(JSON.stringify(entry.edges)),
          historyIndex: nextIndex + 1,
          isDirty: true,
        });
      } else {
        set({ historyIndex: nextIndex });
      }
    },

    // ─── Validation ───
    validateFlow: () => {
      const state = get();
      const errors: ValidationError[] = [];

      // Check for trigger node
      const hasTrigger = state.nodes.some((n) => n.data.nodeType === 'trigger');
      if (!hasTrigger) {
        errors.push({
          nodeId: '',
          message: 'Flow must have a Start Trigger node',
          severity: 'error',
        });
      }

      // Check orphan nodes (no connections)
      state.nodes.forEach((node) => {
        if (node.data.nodeType === 'trigger') return;
        if (node.data.nodeType === 'notes') return;

        const hasIncoming = state.edges.some((e) => e.target === node.id);
        const hasOutgoing = state.edges.some((e) => e.source === node.id);

        if (!hasIncoming && !hasOutgoing) {
          errors.push({
            nodeId: node.id,
            message: `"${node.data.label}" is not connected to any other node`,
            severity: 'warning',
          });
        } else if (!hasIncoming) {
          errors.push({
            nodeId: node.id,
            message: `"${node.data.label}" has no incoming connection`,
            severity: 'warning',
          });
        }
      });

      // Check nodes that require configuration
      state.nodes.forEach((node) => {
        if (!node.data.isConfigured && node.data.nodeType !== 'trigger' && node.data.nodeType !== 'end' && node.data.nodeType !== 'notes') {
          errors.push({
            nodeId: node.id,
            message: `"${node.data.label}" needs configuration`,
            severity: 'info',
          });
        }
      });

      // Check condition nodes have at least 2 outgoing edges
      state.nodes
        .filter((n) => n.data.nodeType === 'condition')
        .forEach((node) => {
          const outEdges = state.edges.filter((e) => e.source === node.id);
          if (outEdges.length < 2) {
            errors.push({
              nodeId: node.id,
              message: `Condition node "${node.data.label}" needs at least 2 branches`,
              severity: 'warning',
            });
          }
        });

      // End nodes should have no outgoing edges
      state.nodes
        .filter((n) => n.data.nodeType === 'end')
        .forEach((node) => {
          const outEdges = state.edges.filter((e) => e.source === node.id);
          if (outEdges.length > 0) {
            errors.push({
              nodeId: node.id,
              message: `End node "${node.data.label}" should not have outgoing connections`,
              severity: 'error',
            });
          }
        });

      set({ validationErrors: errors });
      return errors;
    },

    // ─── UI Actions ───
    toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
    toggleDebugPanel: () => set((s) => ({ showDebugPanel: !s.showDebugPanel })),
    toggleJsonPreview: () => set((s) => ({ showJsonPreview: !s.showJsonPreview })),
    setSearchQuery: (q) => set({ searchQuery: q }),
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    toggleRightPanel: () => set((s) => ({ rightPanelCollapsed: !s.rightPanelCollapsed })),

    // ─── Variable Actions ───
    addVariable: (variable) => {
      set((s) => ({
        variables: { ...s.variables, [variable.name]: variable },
        isDirty: true,
      }));
    },
    removeVariable: (name) => {
      set((s) => {
        const newVars = { ...s.variables };
        delete newVars[name];
        return { variables: newVars, isDirty: true };
      });
    },

    getAncestorVariables: (nodeId: string) => {
      const state = get();
      const variables = new Set<string>();
      const visited = new Set<string>();
      const queue = [nodeId];

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const incomingEdges = state.edges.filter(e => e.target === currentId);
        incomingEdges.forEach(edge => {
          const sourceNode = state.nodes.find(n => n.id === edge.source);
          if (sourceNode) {
            const d = sourceNode.data as any;
            const v = d.variableName || d.responseVariable || d.saveToVariable;
            if (v && typeof v === 'string') {
              variables.add(v);
            }
            queue.push(sourceNode.id);
          }
        });
      }

      return Array.from(variables);
    },
  }))
);

// ─── Auto-save subscription ───
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
useFlowStore.subscribe(
  (state) => state.isDirty,
  (isDirty) => {
    if (isDirty) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        useFlowStore.getState().saveFlow();
      }, 3000);
    }
  }
);
