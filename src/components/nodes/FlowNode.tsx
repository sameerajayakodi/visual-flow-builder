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

const COMPACT_NODE_TYPES = new Set<FlowNodeData["nodeType"]>([
  "trigger",
  "end",
  "delay",
  "notes",
]);

const WIDE_NODE_TYPES = new Set<FlowNodeData["nodeType"]>([
  "text",
  "button",
  "media",
  "card",
  "carousel",
  "form",
  "inputRequest",
  "httpRequest",
  "sendEmail",
  "aiPrompt",
  "notification",
]);

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
  const sizeClass = COMPACT_NODE_TYPES.has(data.nodeType)
    ? "flow-node--compact"
    : WIDE_NODE_TYPES.has(data.nodeType)
      ? "flow-node--wide"
      : "";
  const typeClass = isCondition
    ? "flow-node--condition"
    : data.nodeType === "switch"
      ? "flow-node--switch"
      : data.nodeType === "delay"
        ? "flow-node--delay"
        : data.nodeType === "loop"
          ? "flow-node--loop"
          : "";
  const conditionRules = isCondition ? ((data as any).rules ?? []) : [];
  const conditionCombinator = isCondition
    ? String((data as any).combinator ?? "and")
    : "and";
  const conditionSummary = conditionRules.length
    ? `${conditionRules.length} rule${conditionRules.length === 1 ? "" : "s"}`
    : "No rules";
  const switchCases =
    data.nodeType === "switch"
      ? ((data as any).cases ??
        (data as any).paths ??
        (data as any).options ??
        [])
      : [];
  const switchCount = Array.isArray(switchCases) ? switchCases.length : 0;
  const switchHasDefault = Boolean(
    (data as any).hasDefault ??
    (data as any).defaultPath ??
    (data as any).defaultCase,
  );
  const delayDuration =
    data.nodeType === "delay" ? (data as any).duration : null;
  const delayUnit = data.nodeType === "delay" ? (data as any).unit : null;
  const delayText =
    delayDuration != null && delayUnit
      ? `${delayDuration} ${delayUnit}`
      : "Set duration";
  const loopCount =
    data.nodeType === "loop"
      ? ((data as any).iterations ?? (data as any).maxIterations)
      : null;
  const loopScope =
    data.nodeType === "loop"
      ? ((data as any).scope ?? (data as any).mode)
      : null;
  const loopLabel =
    typeof loopCount === "number" ? `${loopCount} cycles` : "Until stop";
  const loopScopeLabel =
    typeof loopScope === "string" && loopScope.length ? loopScope : "Flow";
  const mediaType = data.nodeType === "media" ? (data as any).mediaType : "";
  const mediaUrl = data.nodeType === "media" ? (data as any).url : "";
  const mediaName = mediaUrl ? String(mediaUrl).split("/").pop() : "No file";
  const cardButtons =
    data.nodeType === "card" ? ((data as any).buttons || []).length : 0;
  const carouselCount =
    data.nodeType === "carousel" ? ((data as any).cards || []).length : 0;
  const formFields =
    data.nodeType === "form" ? ((data as any).fields || []).length : 0;
  const switchVariable =
    data.nodeType === "switch" ? (data as any).variable : "";
  const randomBranches =
    data.nodeType === "randomSplit" ? (data as any).branches || [] : [];
  const randomTotal = Array.isArray(randomBranches)
    ? randomBranches.reduce(
        (sum: number, b: any) => sum + (b.percentage || 0),
        0,
      )
    : 0;
  const dbAction =
    data.nodeType === "databaseAction" ? (data as any).action : "";
  const dbResource =
    data.nodeType === "databaseAction" ? (data as any).resource : "";
  const notificationChannel =
    data.nodeType === "notification" ? (data as any).channel : "";
  const notificationTitle =
    data.nodeType === "notification" ? (data as any).title : "";
  const assignType =
    data.nodeType === "assignAgent" ? (data as any).assignmentType : "";
  const approvalGroup =
    data.nodeType === "approvalRequest" ? (data as any).approverGroup : "";
  const approvalTimeout =
    data.nodeType === "approvalRequest" ? (data as any).timeoutMinutes : null;
  const takeoverQueue =
    data.nodeType === "humanTakeover" ? (data as any).queue : "";
  const takeoverPriority =
    data.nodeType === "humanTakeover" ? (data as any).priority : "";

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
      className={`flow-node ${sizeClass} ${typeClass} ${selected ? "flow-node--selected" : ""} ${data.hasError ? "flow-node--error" : ""} ${isNotes ? "flow-node--notes" : ""}`}
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
          <div className="flow-node__preview flow-node__preview--delay">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Wait</span>
              <span className="flow-node__stat-value">{delayText}</span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Type</span>
              <span className="flow-node__stat-value">Timer</span>
            </div>
          </div>
        )}

        {data.nodeType === "condition" && (
          <div className="flow-node__preview flow-node__preview--condition">
            <div className="flow-node__condition-row">
              <span className="flow-node__condition-label">IF</span>
              <span className="flow-node__condition-text">
                {conditionSummary}
              </span>
              <span className="flow-node__condition-chip">
                {conditionCombinator.toUpperCase()}
              </span>
            </div>
            <div className="flow-node__condition-branches">
              <span className="flow-node__branch flow-node__branch--yes">
                ✓ Yes path
              </span>
              <span className="flow-node__branch flow-node__branch--no">
                ✗ No path
              </span>
            </div>
          </div>
        )}

        {data.nodeType === "media" && (
          <div className="flow-node__preview flow-node__preview--stats">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Type</span>
              <span className="flow-node__stat-value">
                {mediaType || "media"}
              </span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">File</span>
              <span className="flow-node__stat-value">{mediaName}</span>
            </div>
          </div>
        )}

        {data.nodeType === "card" && (
          <div className="flow-node__preview flow-node__preview--stats">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Title</span>
              <span className="flow-node__stat-value">
                {(data as any).title || data.label}
              </span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Buttons</span>
              <span className="flow-node__stat-value">{cardButtons}</span>
            </div>
          </div>
        )}

        {data.nodeType === "carousel" && (
          <div className="flow-node__preview flow-node__preview--stats">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Cards</span>
              <span className="flow-node__stat-value">{carouselCount}</span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Auto</span>
              <span className="flow-node__stat-value">
                {(data as any).autoplay ? "On" : "Off"}
              </span>
            </div>
          </div>
        )}

        {data.nodeType === "form" && (
          <div className="flow-node__preview flow-node__preview--stats">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Fields</span>
              <span className="flow-node__stat-value">{formFields}</span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Submit</span>
              <span className="flow-node__stat-value">
                {(data as any).submitLabel || "Submit"}
              </span>
            </div>
          </div>
        )}

        {data.nodeType === "switch" && (
          <div className="flow-node__preview flow-node__preview--switch">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Cases</span>
              <span className="flow-node__stat-value">
                {switchCount > 0 ? switchCount : "None"}
              </span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">
                {switchVariable ? "Variable" : "Default"}
              </span>
              <span className="flow-node__stat-value">
                {switchVariable || (switchHasDefault ? "Yes" : "No")}
              </span>
            </div>
          </div>
        )}

        {data.nodeType === "randomSplit" && (
          <div className="flow-node__preview flow-node__preview--stats">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Branches</span>
              <span className="flow-node__stat-value">
                {Array.isArray(randomBranches) ? randomBranches.length : 0}
              </span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Total</span>
              <span className="flow-node__stat-value">{randomTotal}%</span>
            </div>
          </div>
        )}

        {data.nodeType === "loop" && (
          <div className="flow-node__preview flow-node__preview--loop">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Repeat</span>
              <span className="flow-node__stat-value">{loopLabel}</span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Scope</span>
              <span className="flow-node__stat-value">{loopScopeLabel}</span>
            </div>
          </div>
        )}

        {data.nodeType === "databaseAction" && (
          <div className="flow-node__preview flow-node__preview--stats">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Action</span>
              <span className="flow-node__stat-value">
                {dbAction || "query"}
              </span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Resource</span>
              <span className="flow-node__stat-value">{dbResource || "-"}</span>
            </div>
          </div>
        )}

        {data.nodeType === "notification" && (
          <div className="flow-node__preview flow-node__preview--stats">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Channel</span>
              <span className="flow-node__stat-value">
                {notificationChannel || "inApp"}
              </span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Title</span>
              <span className="flow-node__stat-value">
                {notificationTitle || data.label}
              </span>
            </div>
          </div>
        )}

        {data.nodeType === "assignAgent" && (
          <div className="flow-node__preview flow-node__preview--stats">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Mode</span>
              <span className="flow-node__stat-value">
                {assignType || "roundRobin"}
              </span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Target</span>
              <span className="flow-node__stat-value">
                {(data as any).agentId || (data as any).skill || "Auto"}
              </span>
            </div>
          </div>
        )}

        {data.nodeType === "approvalRequest" && (
          <div className="flow-node__preview flow-node__preview--stats">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Approvers</span>
              <span className="flow-node__stat-value">
                {approvalGroup || "Group"}
              </span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Timeout</span>
              <span className="flow-node__stat-value">
                {approvalTimeout ? `${approvalTimeout}m` : "None"}
              </span>
            </div>
          </div>
        )}

        {data.nodeType === "humanTakeover" && (
          <div className="flow-node__preview flow-node__preview--stats">
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Queue</span>
              <span className="flow-node__stat-value">
                {takeoverQueue || "-"}
              </span>
            </div>
            <div className="flow-node__stat">
              <span className="flow-node__stat-label">Priority</span>
              <span className="flow-node__stat-value">
                {takeoverPriority || "normal"}
              </span>
            </div>
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
            aria-label="Duplicate"
          >
            <svg
              className="flow-node__action-icon"
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M8 7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2v-2h2V7h-7v2H8V7zm-3 3a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7zm2 0v7h7v-7H7z"
              />
            </svg>
          </button>
          <button
            className="flow-node__action-btn flow-node__action-btn--delete"
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(id);
            }}
            title="Delete"
            aria-label="Delete"
          >
            <svg
              className="flow-node__action-icon"
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9z"
              />
            </svg>
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
