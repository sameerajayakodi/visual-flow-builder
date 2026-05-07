// ─── Node Config Schema System ───
// Declarative schema that auto-generates config UI for each node type.
// No more per-node custom components — the system renders forms automatically.

export type WidgetType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'color-picker'
  | 'slider'
  | 'button-list'
  | 'rule-list'
  | 'field-list'
  | 'card-list'
  | 'case-list'
  | 'branch-list'
  | 'answer-list'
  | 'variable-picker'
  | 'duration'
  | 'key-value'
  | 'toggle-group';

export interface SelectOption {
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

export interface ConfigField {
  key: string;
  label: string;
  type: WidgetType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  defaultValue?: any;
  options?: SelectOption[];
  showWhen?: {
    field: string;
    equals: string | string[];
  };
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  // For list-type widgets
  itemSchema?: ConfigField[];
  addLabel?: string;
  maxItems?: number;
  // For slider
  minLabel?: string;
  maxLabel?: string;
  // For toggle-group
  exclusive?: boolean;
}

export interface ConfigSection {
  title: string;
  icon?: string;
  fields: ConfigField[];
  collapsed?: boolean;
  advanced?: boolean; // Sections marked advanced are hidden by default
}

export interface ConfigTip {
  icon: string;
  text: string;
}

export interface NodeConfigSchema {
  nodeType: string;
  sections: ConfigSection[];
  tips?: ConfigTip[];
  requiredFields?: string[]; // Fields that must be filled for isConfigured = true
}

// ─── Registry ───
const schemaRegistry = new Map<string, NodeConfigSchema>();

export function registerNodeSchema(schema: NodeConfigSchema): void {
  schemaRegistry.set(schema.nodeType, schema);
}

export function getNodeSchema(nodeType: string): NodeConfigSchema | undefined {
  return schemaRegistry.get(nodeType);
}

export function getAllSchemas(): NodeConfigSchema[] {
  return Array.from(schemaRegistry.values());
}

// ─── Auto-validation helper ───
export function isNodeConfigured(nodeType: string, data: Record<string, any>): boolean {
  const schema = getNodeSchema(nodeType);
  if (!schema) return true; // No schema = assume configured

  const requiredFields = schema.requiredFields;
  if (!requiredFields || requiredFields.length === 0) return true;

  return requiredFields.every((fieldKey) => {
    const value = data[fieldKey];
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
}
