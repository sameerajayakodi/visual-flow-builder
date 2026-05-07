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
import { flowToPrompts, promptsToFlow } from '../utils/flowAdapter';
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

      const nodeId = `${type}_${uuidv4().slice(0, 8)}`;
      const nodeData = {
          ...libraryItem.defaultData,
          label: libraryItem.label,
          nodeType: type,
          category: libraryItem.category,
          icon: libraryItem.icon,
          hasError: false,
        } as FlowNodeData;
      // Auto-check configuration using schema
      (nodeData as any).isConfigured = isNodeConfigured(type, nodeData as any);

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

      set({
        nodes: state.nodes.map((n) => {
          if (n.id !== nodeId) return n;
          const merged = { ...n.data, ...data } as FlowNodeData;
          // Auto-recheck configuration status using schema
          (merged as any).isConfigured = isNodeConfigured(merged.nodeType, merged as any);
          return { ...n, data: merged };
        }),
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

      // Prevent duplicate connections
      const exists = state.edges.some(
        (e) =>
          e.source === connection.source &&
          e.target === connection.target &&
          e.sourceHandle === connection.sourceHandle &&
          e.targetHandle === connection.targetHandle
      );
      if (exists) return;

      const newEdge = {
        ...connection,
        id: `edge_${uuidv4().slice(0, 8)}`,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { strokeWidth: 2 },
      };

      set({
        edges: rfAddEdge(newEdge, state.edges),
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
      // Save to localStorage
      const doc = get().exportFlow();
      localStorage.setItem('flowcraft_current_flow', JSON.stringify(doc));
    },

    loadFlow: (doc) => {
      // Support both the old format (for standard example templates) and the new format
      const isNewFormat = doc.prompts !== undefined;
      
      let finalNodes = [];
      let finalEdges = [];
      
      if (isNewFormat) {
        const result = promptsToFlow(doc.prompts);
        finalNodes = result.nodes;
        finalEdges = result.edges;
      } else {
        finalNodes = (doc as any).nodes || [];
        finalEdges = (doc as any).edges || [];
      }

      set({
        flowId: doc.flowId,
        flowName: doc.name,
        flowStatus: (doc.status as any) || 'draft',
        flowVersion: doc.version,
        nodes: finalNodes,
        edges: finalEdges,
        variables: doc.variables,
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
        prompts: flowToPrompts(state.nodes, state.edges),
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
