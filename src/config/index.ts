export { getNodeSchema, isNodeConfigured, registerNodeSchema } from './nodeConfigSchema';
export type { ConfigField, ConfigSection, NodeConfigSchema } from './nodeConfigSchema';
export { nodePreviewRegistry, resolveValue } from './nodePreviewRegistry';
export type { NodePreviewConfig } from './nodePreviewRegistry';

// Initialize all schemas on first import
import './allSchemas';
