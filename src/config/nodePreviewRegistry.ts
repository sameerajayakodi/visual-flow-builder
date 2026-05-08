// ─── Node Preview Registry ───
// Declarative config for how each node type renders its inline preview.
// Only includes nodes that exist in the node library.

import type React from 'react';

export interface StatPreview {
  label: string;
  valueKey: string;
  fallback?: string;
  format?: (value: any, data?: any) => string;
}

export interface NodePreviewConfig {
  type: 'stats' | 'pills' | 'text' | 'condition' | 'custom';
  stats?: StatPreview[];
  pillsArrayKey?: string;
  pillsLabelKey?: string;
  textKey?: string;
  textMaxLength?: number;
  customRenderer?: React.ComponentType<{ data: any }>;
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

// ─── Registry (only for nodes in the library) ───
export const nodePreviewRegistry: Record<string, NodePreviewConfig> = {
  text: {
    type: 'text',
    textKey: 'message',
    textMaxLength: 60,
  },
  condition: {
    type: 'condition',
    previewClass: 'flow-node__preview--condition',
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
    ],
  },
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
          try { return new URL(v).hostname; } catch { return v.slice(0, 20); }
        },
      },
    ],
  },
  sendEmail: {
    type: 'stats',
    stats: [
      { label: 'To', valueKey: 'to', fallback: 'Not set' },
      { label: 'Subject', valueKey: 'subject', fallback: '-' },
    ],
  },
  notification: {
    type: 'stats',
    stats: [
      { label: 'Channel', valueKey: 'channel', fallback: 'push' },
      { label: 'Title', valueKey: 'title', fallback: '-' },
    ],
  },
};
