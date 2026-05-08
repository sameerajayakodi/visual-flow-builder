// ─── LabeledEdge ───
// Custom edge component that displays a label pill (the answer/button text)
// on the connection arrow. Works for all node types with dynamic outputs.

import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from 'reactflow';
import { useFlowStore } from '../../store';

const LabeledEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
  selected,
}) => {
  const deleteEdge = useFlowStore((s) => s.deleteEdge);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const displayLabel = data?.sourceAnswerLabel || label;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: selected ? 20 : 10,
          }}
        >
          {displayLabel && (
            <div className="edge-label-pill">
              {displayLabel}
            </div>
          )}
          {selected && (
            <button
              className="edge-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteEdge(id);
              }}
              title="Remove connection"
            >
              ×
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default LabeledEdge;
