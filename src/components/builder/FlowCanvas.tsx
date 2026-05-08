import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import { useFlowStore } from "../../store";
import type { FlowNodeType } from "../../types";
import { nodeTypes } from "../nodes";
import { edgeTypes } from "../edges";

const FlowCanvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const addNode = useFlowStore((s) => s.addNode);
  const selectNode = useFlowStore((s) => s.selectNode);
  const selectEdge = useFlowStore((s) => s.selectEdge);
  const showMinimap = useFlowStore((s) => s.showMinimap);
  const darkMode = useFlowStore((s) => s.darkMode);
  const [dismissedEmptyHint, setDismissedEmptyHint] = useState(false);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        "application/flowcraft-node",
      ) as FlowNodeType;
      if (!type || !reactFlowInstance.current || !reactFlowWrapper.current)
        return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      addNode(type, position);
    },
    [addNode],
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => {
      selectEdge(edge.id);
    },
    [selectEdge],
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="flow-canvas"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: "labeled",
          animated: true,
          style: { strokeWidth: 2, stroke: darkMode ? "#64748b" : "#94a3b8" },
        }}
        connectionLineStyle={{ strokeWidth: 2, stroke: "#10b981" }}
        connectionLineType={ConnectionLineType.SmoothStep}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color={darkMode ? "#334155" : "#e2e8f0"}
          gap={20}
          size={1.5}
        />
        <Controls
          className="flow-controls"
          position="bottom-left"
          showInteractive={false}
        />
        {showMinimap && (
          <MiniMap
            className="flow-minimap"
            nodeStrokeWidth={3}
            zoomable
            pannable
            position="bottom-right"
            nodeColor={(node) => {
              switch (node.data?.category) {
                case "trigger":
                  return "#10b981";
                case "message":
                  return "#3b82f6";
                case "logic":
                  return "#f97316";
                case "action":
                  return "#8b5cf6";
                case "interaction":
                  return "#ec4899";
                case "utility":
                  return "#78716c";
                default:
                  return "#94a3b8";
              }
            }}
          />
        )}
      </ReactFlow>

      {/* Empty state hint */}
      {nodes.length <= 1 && !dismissedEmptyHint && (
        <div
          className="flow-canvas__hint-toast"
          role="status"
          aria-live="polite"
        >
          <div className="flow-canvas__hint-header">
            <span>Start building your flow</span>
            <button
              type="button"
              className="flow-canvas__hint-close"
              onClick={() => setDismissedEmptyHint(true)}
              aria-label="Dismiss hint"
            >
              ×
            </button>
          </div>
          <p>Drag blocks from the left sidebar and drop them on the canvas.</p>
        </div>
      )}
    </div>
  );
};

export default FlowCanvas;
