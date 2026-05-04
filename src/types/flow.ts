import type { Node, Edge, XYPosition } from 'reactflow';

// ─── Node Category Types ───
export type NodeCategory =
  | 'trigger'
  | 'message'
  | 'logic'
  | 'action'
  | 'interaction'
  | 'utility';

// ─── Node Type Definitions ───
export type FlowNodeType =
  | 'trigger'
  | 'text'
  | 'button'
  | 'media'
  | 'card'
  | 'carousel'
  | 'form'
  | 'inputRequest'
  | 'condition'
  | 'switch'
  | 'delay'
  | 'randomSplit'
  | 'loop'
  | 'httpRequest'
  | 'saveVariable'
  | 'sendEmail'
  | 'aiPrompt'
  | 'databaseAction'
  | 'notification'
  | 'assignAgent'
  | 'approvalRequest'
  | 'humanTakeover'
  | 'notes'
  | 'end';

// ─── Node Data Interfaces ───
export interface BaseNodeData {
  label: string;
  description?: string;
  nodeType: FlowNodeType;
  category: NodeCategory;
  icon: string;
  isConfigured: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export interface TriggerNodeData extends BaseNodeData {
  nodeType: 'trigger';
  triggerType: 'manual' | 'keyword' | 'schedule' | 'api' | 'webhook';
  config: {
    keyword?: string;
    schedule?: string;
    endpoint?: string;
  };
}

export interface TextNodeData extends BaseNodeData {
  nodeType: 'text';
  message: string;
  variables: string[];
  formatting?: {
    bold?: boolean;
    italic?: boolean;
  };
}

export interface ButtonNodeData extends BaseNodeData {
  nodeType: 'button';
  message: string;
  buttons: Array<{
    id: string;
    label: string;
    value: string;
    type: 'reply' | 'url' | 'action';
  }>;
}

export interface ConditionNodeData extends BaseNodeData {
  nodeType: 'condition';
  rules: Array<{
    id: string;
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists' | 'notExists';
    value: string;
  }>;
  combinator: 'and' | 'or';
}

export interface InputNodeData extends BaseNodeData {
  nodeType: 'inputRequest';
  prompt: string;
  variableName: string;
  inputType: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select';
  validation?: {
    required: boolean;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: string[];
}

export interface DelayNodeData extends BaseNodeData {
  nodeType: 'delay';
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
}

export interface EndNodeData extends BaseNodeData {
  nodeType: 'end';
  endType: 'complete' | 'redirect' | 'restart';
}

export interface HttpRequestNodeData extends BaseNodeData {
  nodeType: 'httpRequest';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body: string;
  responseVariable: string;
}

export interface SaveVariableNodeData extends BaseNodeData {
  nodeType: 'saveVariable';
  variableName: string;
  value: string;
  valueType: 'static' | 'expression' | 'fromPrevious';
}

export interface SendEmailNodeData extends BaseNodeData {
  nodeType: 'sendEmail';
  to: string;
  subject: string;
  body: string;
  isHtml: boolean;
}

export interface AiPromptNodeData extends BaseNodeData {
  nodeType: 'aiPrompt';
  prompt: string;
  model: string;
  responseVariable: string;
  temperature: number;
}

export interface NotificationNodeData extends BaseNodeData {
  nodeType: 'notification';
  channel: 'push' | 'email' | 'sms' | 'inApp';
  title: string;
  message: string;
  target: string;
}

export interface AssignAgentNodeData extends BaseNodeData {
  nodeType: 'assignAgent';
  assignmentType: 'specific' | 'roundRobin' | 'leastBusy' | 'skill';
  agentId?: string;
  skill?: string;
}

export interface NotesNodeData extends BaseNodeData {
  nodeType: 'notes';
  content: string;
  color: string;
}

export type FlowNodeData =
  | TriggerNodeData
  | TextNodeData
  | ButtonNodeData
  | ConditionNodeData
  | InputNodeData
  | DelayNodeData
  | EndNodeData
  | HttpRequestNodeData
  | SaveVariableNodeData
  | SendEmailNodeData
  | AiPromptNodeData
  | NotificationNodeData
  | AssignAgentNodeData
  | NotesNodeData
  | BaseNodeData;

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

// ─── Flow Document ───
export interface FlowDocument {
  flowId: string;
  name: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  trigger: {
    type: string;
  };
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: Record<string, FlowVariable>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    description?: string;
    tags?: string[];
  };
}

export interface FlowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: string;
  scope: 'flow' | 'session' | 'global';
}

// ─── Node Library Definition ───
export interface NodeLibraryItem {
  type: FlowNodeType;
  label: string;
  description: string;
  category: NodeCategory;
  icon: string;
  color: string;
  defaultData: Partial<FlowNodeData>;
}

// ─── Validation ───
export interface ValidationError {
  nodeId: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// ─── History for Undo/Redo ───
export interface HistoryEntry {
  nodes: FlowNode[];
  edges: FlowEdge[];
  timestamp: number;
}
