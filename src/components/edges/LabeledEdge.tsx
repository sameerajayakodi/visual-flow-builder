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
}) => {
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
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            className="edge-label-pill"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default LabeledEdge;
