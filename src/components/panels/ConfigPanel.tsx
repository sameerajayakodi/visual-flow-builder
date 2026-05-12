// ─── ConfigPanel ───
// Slim shell that delegates to ConfigRenderer for schema-driven config.
// Replaces the original 2,063-line monolith.

import React, { useCallback, useMemo } from 'react';
import { getNodeColor } from '../../constants';
import { getNodeSchema } from '../../config';
import { useFlowStore } from '../../store';
import ConfigRenderer from './ConfigRenderer';

const ConfigPanel: React.FC = () => {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const selectedEdgeId = useFlowStore((s) => s.selectedEdgeId);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const deleteEdge = useFlowStore((s) => s.deleteEdge);
  const updateEdge = useFlowStore((s) => s.updateEdge);
  const duplicateNode = useFlowStore((s) => s.duplicateNode);
  const rightPanelCollapsed = useFlowStore((s) => s.rightPanelCollapsed);
  const toggleRightPanel = useFlowStore((s) => s.toggleRightPanel);
  const getAncestorVariables = useFlowStore((s) => s.getAncestorVariables);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  const availableVariables = useMemo(() => {
    if (!selectedNodeId) return [];
    return getAncestorVariables(selectedNodeId);
  }, [selectedNodeId, getAncestorVariables, nodes, edges]);

  const handleUpdate = useCallback(
    (field: string, value: any) => {
      if (!selectedNodeId) return;
      updateNodeData(selectedNodeId, { [field]: value } as any);
    },
    [selectedNodeId, updateNodeData],
  );

  if (rightPanelCollapsed) return null;

  // ─── Edge Config ───
  if (!selectedNode && selectedEdge) {
    const sourceNode = nodes.find((n) => n.id === selectedEdge.source);
    const targetNode = nodes.find((n) => n.id === selectedEdge.target);

    return (
      <div className="config-panel">
        <div className="config-panel__header" style={{ borderColor: '#94a3b8' }}>
          <div className="config-panel__header-top">
            <span className="config-panel__icon" style={{ background: '#e2e8f0' }}>↔</span>
            <div className="config-panel__header-info">
              <span className="config-panel__type" style={{ color: '#64748b' }}>Connection</span>
            </div>
            <button className="config-panel__close" onClick={toggleRightPanel} title="Close panel">✕</button>
          </div>
        </div>

        <div className="config-panel__content">
          <div className="config-field">
            <label className="config-field__label">From</label>
            <select
              className="config-field__select"
              value={selectedEdge.source}
              onChange={(e) => updateEdge(selectedEdge.id, { source: e.target.value, sourceHandle: undefined })}
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>{node.data?.label || node.id}</option>
              ))}
            </select>
          </div>
          <div className="config-field">
            <label className="config-field__label">To</label>
            <select
              className="config-field__select"
              value={selectedEdge.target}
              onChange={(e) => updateEdge(selectedEdge.id, { target: e.target.value, targetHandle: undefined })}
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>{node.data?.label || node.id}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="config-panel__footer">
          <button className="config-panel__btn config-panel__btn--delete" onClick={() => deleteEdge(selectedEdge.id)}>
            🗑 Remove connection
          </button>
        </div>
      </div>
    );
  }

  if (!selectedNode) return null;

  const color = getNodeColor(selectedNode.data.nodeType);
  const isTrigger = selectedNode.data.nodeType === 'trigger';
  const schema = getNodeSchema(selectedNode.data.nodeType);

  return (
    <div className="config-panel">
      {/* Header */}
      <div className="config-panel__header" style={{ borderColor: color }}>
        <div className="config-panel__header-top">
          <span className="config-panel__icon" style={{ background: color + '18' }}>
            {selectedNode.data.icon}
          </span>
          <div className="config-panel__header-info">
            <span className="config-panel__type" style={{ color }}>
              {selectedNode.data.nodeType.charAt(0).toUpperCase() + selectedNode.data.nodeType.slice(1)}
            </span>
          </div>
          <button className="config-panel__close" onClick={toggleRightPanel} title="Close panel">✕</button>
        </div>
      </div>

      {/* Content */}
      <div className="config-panel__content">
        {/* Label field — all nodes */}
        <div className="config-field">
          <label className="config-field__label">Label</label>
          <input
            type="text"
            className="config-field__input"
            value={selectedNode.data.label}
            onChange={(e) => handleUpdate('label', e.target.value)}
          />
        </div>

        {/* Description field */}
        <div className="config-field">
          <label className="config-field__label">Description</label>
          <input
            type="text"
            className="config-field__input"
            value={selectedNode.data.description || ''}
            onChange={(e) => handleUpdate('description', e.target.value)}
            placeholder="Add a description..."
          />
        </div>

        <div className="config-panel__divider" />

        {/* Schema-driven config (replaces all 23 custom components) */}
        {schema ? (
          <ConfigRenderer
            schema={schema}
            data={selectedNode.data as any}
            onUpdate={handleUpdate}
            availableVariables={availableVariables}
          />
        ) : (
          <div className="config-panel__placeholder">
            <span className="config-panel__placeholder-icon">⚙️</span>
            <p className="config-panel__placeholder-text">
              Configuration for <strong>{selectedNode.data.label}</strong> will be available soon.
            </p>
            <p className="config-panel__placeholder-hint">
              This node type is ready for future expansion.
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {!isTrigger && (
        <div className="config-panel__footer">
          <button
            className="config-panel__btn config-panel__btn--duplicate"
            onClick={() => duplicateNode(selectedNodeId!)}
          >
            ⧉ Duplicate
          </button>
          <button
            className="config-panel__btn config-panel__btn--delete"
            onClick={() => deleteNode(selectedNodeId!)}
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;
