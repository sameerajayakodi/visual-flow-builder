import React, { memo, useCallback } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { getNodeColor } from "../../constants";
import { useFlowStore } from "../../store";
import type { FlowNodeData, NotesNodeData } from "../../types";

const CATEGORY_LABELS: Record<FlowNodeData["category"], string> = {
  trigger: "Trigger",
  message: "Message",
  logic: "Logic",
  action: "Action",
  interaction: "Human",
  utility: "Utility",
};

const FlowNodeComponent: React.FC<NodeProps<FlowNodeData>> = ({
  id,
  data,
  selected,
}) => {
  const selectNode = useFlowStore((s) => s.selectNode);
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const duplicateNode = useFlowStore((s) => s.duplicateNode);

  const color = getNodeColor(data.nodeType);
  const isEnd = data.nodeType === "end";
  const isTrigger = data.nodeType === "trigger";
  const isNotes = data.nodeType === "notes";
  const isCondition = data.nodeType === "condition";
  const showConfigStatus = !isNotes && !isTrigger && !isEnd;
  const statusTone = data.hasError
    ? "error"
    : showConfigStatus && !data.isConfigured
      ? "warn"
      : "ready";
  const statusLabel = data.hasError
    ? "Error"
    : showConfigStatus && !data.isConfigured
      ? "Needs setup"
      : "Ready";
  const statusTitle = data.hasError
    ? (data.errorMessage ?? "This node has an error.")
    : showConfigStatus && !data.isConfigured
      ? "This node needs configuration."
      : "This node is configured.";
  const categoryLabel = CATEGORY_LABELS[data.category] ?? data.category;
  const notesColor = isNotes ? (data as NotesNodeData).color : undefined;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectNode(id);
    },
    [id, selectNode],
  );

  return (
    <div
      onClick={handleClick}
      className={`flow-node ${selected ? "flow-node--selected" : ""} ${data.hasError ? "flow-node--error" : ""} ${isNotes ? "flow-node--notes" : ""}`}
      style={
        {
          "--node-color": color,
          "--node-color-light": color + "18",
          "--node-color-medium": color + "40",
          "--node-surface": notesColor ?? "var(--bg-card)",
        } as React.CSSProperties
      }
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

      {/* Node content */}
      <div className="flow-node__body">
        <div className="flow-node__header">
          <span className="flow-node__icon-wrap">
            <span className="flow-node__icon">{data.icon}</span>
          </span>
          <div className="flow-node__info">
            <div className="flow-node__title-row">
              <span className="flow-node__label">{data.label}</span>
              <span
                className={`flow-node__status flow-node__status--${statusTone}`}
                title={statusTitle}
              >
                {statusLabel}
              </span>
            </div>
            <div className="flow-node__meta">
              <span className="flow-node__category">{categoryLabel}</span>
              {data.description && (
                <span className="flow-node__description">
                  {data.description}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick preview of node content */}
        {data.nodeType === "text" && (data as any).message && (
          <div className="flow-node__preview">
            {((data as any).message as string).slice(0, 60)}
            {((data as any).message as string).length > 60 ? "..." : ""}
          </div>
        )}

        {data.nodeType === "button" && (data as any).buttons && (
          <div className="flow-node__preview">
            {((data as any).buttons as any[]).map((b: any, i: number) => (
              <span key={i} className="flow-node__button-pill">
                {b.label}
              </span>
            ))}
          </div>
        )}

        {data.nodeType === "delay" && (
          <div className="flow-node__preview">
            Wait {(data as any).duration} {(data as any).unit}
          </div>
        )}

        {data.nodeType === "condition" && (
          <div className="flow-node__preview flow-node__preview--condition">
            <span className="flow-node__branch flow-node__branch--yes">
              ✓ Yes
            </span>
            <span className="flow-node__branch flow-node__branch--no">
              ✗ No
            </span>
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
            style={{ left: "30%" }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="flow-handle flow-handle--source flow-handle--no"
            id="no"
            style={{ left: "70%" }}
          />
        </>
      )}
    </div>
  );
};

export default memo(FlowNodeComponent);
