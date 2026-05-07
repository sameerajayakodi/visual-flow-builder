// ─── Node Preview Registry ───
// Declarative config for how each node type renders its inline preview
// on the canvas. Replaces 20+ if/else blocks in FlowNode.tsx.

import type React from 'react';

export interface StatPreview {
  label: string;
  valueKey: string; // dot notation: 'buttons.length', 'cards.length'
  fallback?: string;
  format?: (value: any) => string;
}

export interface NodePreviewConfig {
  type: 'stats' | 'pills' | 'text' | 'condition' | 'custom';

  // For type: 'stats'
  stats?: StatPreview[];

  // For type: 'pills'
  pillsArrayKey?: string;
  pillsLabelKey?: string;

  // For type: 'text'
  textKey?: string;
  textMaxLength?: number;

  // For type: 'condition'
  // (uses built-in condition renderer)

  // For type: 'custom'
  customRenderer?: React.ComponentType<{ data: any }>;

  // Extra CSS class for the preview wrapper
  previewClass?: string;
}

// ─── Helper: resolve dot-notation keys ───
export function resolveValue(data: any, key: string): any {
  const parts = key.split('.');
  let current = data;
  for (const part of parts) {
    if (current == null) return undefined;
    if (part === 'length' && Array.isArray(current)) return current.length;
    current = current[part];
  }
  return current;
}

// ─── Registry ───
export const nodePreviewRegistry: Record<string, NodePreviewConfig> = {
  // ─── Messages ───
  text: {
    type: 'text',
    textKey: 'message',
    textMaxLength: 60,
  },
  button: {
    type: 'pills',
    pillsArrayKey: 'buttons',
    pillsLabelKey: 'label',
  },
  media: {
    type: 'stats',
    stats: [
      { label: 'Type', valueKey: 'mediaType', fallback: 'media' },
      {
        label: 'File',
        valueKey: 'url',
        fallback: 'No file',
        format: (v: string) => (v ? String(v).split('/').pop() || 'File' : 'No file'),
      },
    ],
  },
  card: {
    type: 'stats',
    stats: [
      { label: 'Title', valueKey: 'title' },
      {
        label: 'Buttons',
        valueKey: 'buttons',
        fallback: '0',
        format: (v: any) => String(Array.isArray(v) ? v.length : 0),
      },
    ],
  },
  carousel: {
    type: 'stats',
    stats: [
      {
        label: 'Cards',
        valueKey: 'cards',
        fallback: '0',
        format: (v: any) => String(Array.isArray(v) ? v.length : 0),
      },
      {
        label: 'Auto',
        valueKey: 'autoplay',
        format: (v: any) => (v ? 'On' : 'Off'),
      },
    ],
  },
  form: {
    type: 'stats',
    stats: [
      {
        label: 'Fields',
        valueKey: 'fields',
        fallback: '0',
        format: (v: any) => String(Array.isArray(v) ? v.length : 0),
      },
      { label: 'Submit', valueKey: 'submitLabel', fallback: 'Submit' },
    ],
  },
  inputRequest: {
    type: 'stats',
    stats: [
      { label: 'Type', valueKey: 'inputType', fallback: 'text' },
      { label: 'Save as', valueKey: 'variableName', fallback: '-' },
    ],
  },

  // ─── Logic ───
  condition: {
    type: 'condition',
    previewClass: 'flow-node__preview--condition',
  },
  switch: {
    type: 'stats',
    previewClass: 'flow-node__preview--switch',
    stats: [
      {
        label: 'Cases',
        valueKey: 'cases',
        fallback: 'None',
        format: (v: any) => (Array.isArray(v) && v.length > 0 ? String(v.length) : 'None'),
      },
      {
        label: 'Variable',
        valueKey: 'variable',
        fallback: '-',
      },
    ],
  },
  delay: {
    type: 'stats',
    previewClass: 'flow-node__preview--delay',
    stats: [
      {
        label: 'Wait',
        valueKey: 'duration',
        fallback: 'Set duration',
        format: (v: any, data?: any) => {
          if (v == null) return 'Set duration';
          const unit = data?.unit || 'seconds';
          return `${v} ${unit}`;
        },
      },
      { label: 'Type', valueKey: '_static', fallback: 'Timer', format: () => 'Timer' },
    ],
  },
  randomSplit: {
    type: 'stats',
    stats: [
      {
        label: 'Branches',
        valueKey: 'branches',
        fallback: '0',
        format: (v: any) => String(Array.isArray(v) ? v.length : 0),
      },
      {
        label: 'Total',
        valueKey: 'branches',
        fallback: '0%',
        format: (v: any) => {
          if (!Array.isArray(v)) return '0%';
          return v.reduce((sum: number, b: any) => sum + (b.percentage || 0), 0) + '%';
        },
      },
    ],
  },
  loop: {
    type: 'stats',
    previewClass: 'flow-node__preview--loop',
    stats: [
      {
        label: 'Repeat',
        valueKey: 'iterations',
        fallback: 'Until stop',
        format: (v: any) => (typeof v === 'number' ? `${v} cycles` : 'Until stop'),
      },
      {
        label: 'Scope',
        valueKey: 'scope',
        fallback: 'Flow',
        format: (v: any) => (typeof v === 'string' && v.length ? v : 'Flow'),
      },
    ],
  },

  // ─── Actions ───
  httpRequest: {
    type: 'stats',
    stats: [
      { label: 'Method', valueKey: 'method', fallback: 'GET' },
      {
        label: 'URL',
        valueKey: 'url',
        fallback: 'Not set',
        format: (v: string) => {
          if (!v) return 'Not set';
          try {
            return new URL(v).hostname;
          } catch {
            return v.slice(0, 20);
          }
        },
      },
    ],
  },
  saveVariable: {
    type: 'stats',
    stats: [
      { label: 'Variable', valueKey: 'variableName', fallback: '-' },
      { label: 'Type', valueKey: 'valueType', fallback: 'static' },
    ],
  },
  sendEmail: {
    type: 'stats',
    stats: [
      { label: 'To', valueKey: 'to', fallback: 'Not set' },
      {
        label: 'Subject',
        valueKey: 'subject',
        fallback: '-',
        format: (v: string) => (v && v.length > 18 ? v.slice(0, 18) + '…' : v || '-'),
      },
    ],
  },
  aiPrompt: {
    type: 'stats',
    stats: [
      { label: 'Model', valueKey: 'model', fallback: 'gpt-4' },
      { label: 'Temp', valueKey: 'temperature', fallback: '0.7' },
    ],
  },
  databaseAction: {
    type: 'stats',
    stats: [
      { label: 'Action', valueKey: 'action', fallback: 'query' },
      { label: 'Resource', valueKey: 'resource', fallback: '-' },
    ],
  },
  notification: {
    type: 'stats',
    stats: [
      { label: 'Channel', valueKey: 'channel', fallback: 'inApp' },
      { label: 'Title', valueKey: 'title', fallback: '-' },
    ],
  },

  // ─── Human Interaction ───
  assignAgent: {
    type: 'stats',
    stats: [
      { label: 'Mode', valueKey: 'assignmentType', fallback: 'roundRobin' },
      {
        label: 'Target',
        valueKey: 'agentId',
        fallback: 'Auto',
        format: (v: any, data?: any) => v || data?.skill || 'Auto',
      },
    ],
  },
  approvalRequest: {
    type: 'stats',
    stats: [
      { label: 'Approvers', valueKey: 'approverGroup', fallback: 'Group' },
      {
        label: 'Timeout',
        valueKey: 'timeoutMinutes',
        fallback: 'None',
        format: (v: any) => (v ? `${v}m` : 'None'),
      },
    ],
  },
  humanTakeover: {
    type: 'stats',
    stats: [
      { label: 'Queue', valueKey: 'queue', fallback: '-' },
      { label: 'Priority', valueKey: 'priority', fallback: 'normal' },
    ],
  },
};
