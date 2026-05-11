import type { Edge, Node } from 'reactflow';

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
  | 'end'
  | 'questionnaire';

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

export interface MediaNodeData extends BaseNodeData {
  nodeType: 'media';
  mediaType: 'image' | 'video' | 'audio' | 'file';
  url: string;
  caption?: string;
  altText?: string;
  autoplay?: boolean;
  loop?: boolean;
}

export interface CardNodeData extends BaseNodeData {
  nodeType: 'card';
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  layout?: 'vertical' | 'horizontal';
  buttons: Array<{
    id: string;
    label: string;
    value: string;
    type: 'reply' | 'url' | 'action';
  }>;
}

export interface CarouselNodeData extends BaseNodeData {
  nodeType: 'carousel';
  cards: Array<{
    id: string;
    title: string;
    subtitle?: string;
    body?: string;
    imageUrl?: string;
    buttons?: Array<{
      id: string;
      label: string;
      value: string;
      type: 'reply' | 'url' | 'action';
    }>;
  }>;
  autoplay?: boolean;
  loop?: boolean;
}

export interface FormNodeData extends BaseNodeData {
  nodeType: 'form';
  title: string;
  description?: string;
  fields: Array<{
    id: string;
    label: string;
    name: string;
    type: 'text' | 'email' | 'number' | 'phone' | 'date' | 'select' | 'textarea';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
  submitLabel?: string;
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

export interface SwitchNodeData extends BaseNodeData {
  nodeType: 'switch';
  variable: string;
  cases: Array<{
    id: string;
    value: string;
    label: string;
  }>;
  defaultCaseLabel?: string;
}

export interface DelayNodeData extends BaseNodeData {
  nodeType: 'delay';
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
}

export interface RandomSplitNodeData extends BaseNodeData {
  nodeType: 'randomSplit';
  branches: Array<{
    id: string;
    label: string;
    percentage: number;
  }>;
}

export interface LoopNodeData extends BaseNodeData {
  nodeType: 'loop';
  loopType: 'count' | 'until';
  iterations?: number;
  condition?: string;
  maxIterations?: number;
  delaySeconds?: number;
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

export interface DatabaseActionNodeData extends BaseNodeData {
  nodeType: 'databaseAction';
  action: 'insert' | 'update' | 'delete' | 'query';
  resource: string;
  filter?: string;
  data?: string;
  resultVariable?: string;
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

export interface ApprovalRequestNodeData extends BaseNodeData {
  nodeType: 'approvalRequest';
  approverGroup: string;
  message: string;
  timeoutMinutes?: number;
  onTimeout: 'autoApprove' | 'autoReject' | 'escalate';
  escalationTarget?: string;
}

export interface HumanTakeoverNodeData extends BaseNodeData {
  nodeType: 'humanTakeover';
  queue: string;
  priority: 'low' | 'normal' | 'high';
  handoffMessage: string;
  fallbackMessage?: string;
  includeTranscript: boolean;
}

export interface NotesNodeData extends BaseNodeData {
  nodeType: 'notes';
  content: string;
  color: string;
}

export interface QuestionnaireNodeData extends BaseNodeData {
  nodeType: 'questionnaire';
  promptKey?: string;
  language: string;
  text: string;
  promptProps: string[];
  inputFormat?: 'button' | 'checkbox' | 'radio' | 'dropdown' | 'list';
  answers: Array<{
    id: string;
    aIndex: number;
    text: string;
  }>;
}

export type FlowNodeData =
  | TriggerNodeData
  | TextNodeData
  | ButtonNodeData
  | MediaNodeData
  | CardNodeData
  | CarouselNodeData
  | FormNodeData
  | ConditionNodeData
  | SwitchNodeData
  | DelayNodeData
  | RandomSplitNodeData
  | LoopNodeData
  | EndNodeData
  | HttpRequestNodeData
  | DatabaseActionNodeData
  | SaveVariableNodeData
  | SendEmailNodeData
  | AiPromptNodeData
  | NotificationNodeData
  | AssignAgentNodeData
  | ApprovalRequestNodeData
  | HumanTakeoverNodeData
  | NotesNodeData
  | QuestionnaireNodeData
  | BaseNodeData;

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

// ─── Flow Document (supports both canvas format and export format) ───
export interface FlowDocument {
  flowId?: string;
  name?: string;
  version?: number;
  status?: string;
  // Internal canvas format
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  // Prompts export (questionnaire nodes only — auto-indexed)
  prompts?: Array<{
    promptIndex: number;
    promptKey: string;
    language: string;
    text: string;
    promptType: string[];
    answers: Array<{
      answerIndex: number;
      text: string;
      nextPromptIndex?: number;
      nextLanguage?: string;
    }>;
  }>;
  // Steps export (ALL node types — generic routing map)
  steps?: Array<{
    id: number;
    type: string;
    name: string;
    config: Record<string, any>;
    nextSteps: Record<string, number>;
  }>;
  variables?: Record<string, FlowVariable>;
  metadata?: any;
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
