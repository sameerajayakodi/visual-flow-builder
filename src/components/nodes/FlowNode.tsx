import React, { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { FlowNodeData } from '../../types';
import { getNodeColor } from '../../constants';
import { useFlowStore } from '../../store';

const FlowNodeComponent: React.FC<NodeProps<FlowNodeData>> = ({
  id,
  data,
  selected,
}) => {
  const selectNode = useFlowStore((s) => s.selectNode);
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const duplicateNode = useFlowStore((s) => s.duplicateNode);

  const color = getNodeColor(data.nodeType);
  const isEnd = data.nodeType === 'end';
  const isTrigger = data.nodeType === 'trigger';
  const isNotes = data.nodeType === 'notes';
  const isCondition = data.nodeType === 'condition';

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectNode(id);
    },
    [id, selectNode]
  );

  return (
    <div
      onClick={handleClick}
      className={`flow-node ${selected ? 'flow-node--selected' : ''} ${data.hasError ? 'flow-node--error' : ''}`}
      style={{
        '--node-color': color,
        '--node-color-light': color + '18',
        '--node-color-medium': color + '40',
      } as React.CSSProperties}
    >
      {/* Incoming handle */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="flow-handle flow-handle--target"
          id="target"
        />
      )}

      {/* Node header bar */}
      <div className="flow-node__color-bar" style={{ background: color }} />

      {/* Node content */}
      <div className="flow-node__body">
        <div className="flow-node__header">
          <span className="flow-node__icon">{data.icon}</span>
          <div className="flow-node__info">
            <span className="flow-node__label">{data.label}</span>
            {data.description && (
              <span className="flow-node__description">{data.description}</span>
            )}
          </div>
          {data.hasError && <span className="flow-node__error-badge">!</span>}
          {!data.isConfigured && !isNotes && !isTrigger && !isEnd && (
            <span className="flow-node__unconfigured-badge" title="Needs configuration">●</span>
          )}
        </div>

        {/* Quick preview of node content */}
        {data.nodeType === 'text' && (data as any).message && (
          <div className="flow-node__preview">
            {((data as any).message as string).slice(0, 60)}
            {((data as any).message as string).length > 60 ? '...' : ''}
          </div>
        )}

        {data.nodeType === 'button' && (data as any).buttons && (
          <div className="flow-node__preview">
            {((data as any).buttons as any[]).map((b: any, i: number) => (
              <span key={i} className="flow-node__button-pill">
                {b.label}
              </span>
            ))}
          </div>
        )}

        {data.nodeType === 'delay' && (
          <div className="flow-node__preview">
            Wait {(data as any).duration} {(data as any).unit}
          </div>
        )}

        {data.nodeType === 'condition' && (
          <div className="flow-node__preview flow-node__preview--condition">
            <span className="flow-node__branch flow-node__branch--yes">✓ Yes</span>
            <span className="flow-node__branch flow-node__branch--no">✗ No</span>
          </div>
        )}
      </div>

      {/* Quick actions on hover */}
      {selected && !isTrigger && (
        <div className="flow-node__actions">
          <button
            className="flow-node__action-btn"
            onClick={(e) => {
              e.stopPropagation();
              duplicateNode(id);
            }}
            title="Duplicate"
          >
            ⧉
          </button>
          <button
            className="flow-node__action-btn flow-node__action-btn--delete"
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(id);
            }}
            title="Delete"
          >
            ✕
          </button>
        </div>
      )}

      {/* Outgoing handle(s) */}
      {!isEnd && !isCondition && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="flow-handle flow-handle--source"
          id="source"
        />
      )}

      {/* Condition node: Yes / No handles */}
      {isCondition && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            className="flow-handle flow-handle--source flow-handle--yes"
            id="yes"
            style={{ left: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="flow-handle flow-handle--source flow-handle--no"
            id="no"
            style={{ left: '70%' }}
          />
        </>
      )}
    </div>
  );
};

export default memo(FlowNodeComponent);
