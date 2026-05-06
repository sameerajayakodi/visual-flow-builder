import React, { useCallback } from "react";
import { getNodeColor } from "../../constants";
import { useFlowStore } from "../../store";

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

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  const handleUpdate = useCallback(
    (field: string, value: any) => {
      if (!selectedNodeId) return;
      updateNodeData(selectedNodeId, { [field]: value } as any);
    },
    [selectedNodeId, updateNodeData],
  );

  if (rightPanelCollapsed) {
    return null;
  }

  if (!selectedNode && selectedEdge) {
    const sourceNode = nodes.find((n) => n.id === selectedEdge.source);
    const targetNode = nodes.find((n) => n.id === selectedEdge.target);

    return (
      <div className="config-panel">
        <div
          className="config-panel__header"
          style={{ borderColor: "#94a3b8" }}
        >
          <div className="config-panel__header-top">
            <span
              className="config-panel__icon"
              style={{ background: "#e2e8f0" }}
            >
              ↔
            </span>
            <div className="config-panel__header-info">
              <span className="config-panel__type" style={{ color: "#64748b" }}>
                Connection
              </span>
            </div>
            <button
              className="config-panel__close"
              onClick={toggleRightPanel}
              title="Close panel"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="config-panel__content">
          <div className="config-field">
            <label className="config-field__label">From</label>
            <select
              className="config-field__select"
              value={selectedEdge.source}
              onChange={(e) =>
                updateEdge(selectedEdge.id, {
                  source: e.target.value,
                  sourceHandle: undefined,
                })
              }
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data?.label || node.id}
                </option>
              ))}
            </select>
          </div>
          <div className="config-field">
            <label className="config-field__label">To</label>
            <select
              className="config-field__select"
              value={selectedEdge.target}
              onChange={(e) =>
                updateEdge(selectedEdge.id, {
                  target: e.target.value,
                  targetHandle: undefined,
                })
              }
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data?.label || node.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="config-panel__footer">
          <button
            className="config-panel__btn config-panel__btn--delete"
            onClick={() => deleteEdge(selectedEdge.id)}
          >
            🗑 Remove connection
          </button>
        </div>
      </div>
    );
  }

  if (!selectedNode) {
    return null;
  }

  const color = getNodeColor(selectedNode.data.nodeType);
  const isTrigger = selectedNode.data.nodeType === "trigger";

  return (
    <div className="config-panel">
      {/* Header */}
      <div className="config-panel__header" style={{ borderColor: color }}>
        <div className="config-panel__header-top">
          <span
            className="config-panel__icon"
            style={{ background: color + "18" }}
          >
            {selectedNode.data.icon}
          </span>
          <div className="config-panel__header-info">
            <span className="config-panel__type" style={{ color }}>
              {selectedNode.data.nodeType.charAt(0).toUpperCase() +
                selectedNode.data.nodeType.slice(1)}
            </span>
          </div>
          <button
            className="config-panel__close"
            onClick={toggleRightPanel}
            title="Close panel"
          >
            ✕
          </button>
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
            onChange={(e) => handleUpdate("label", e.target.value)}
          />
        </div>

        {/* Description field */}
        <div className="config-field">
          <label className="config-field__label">Description</label>
          <input
            type="text"
            className="config-field__input"
            value={selectedNode.data.description || ""}
            onChange={(e) => handleUpdate("description", e.target.value)}
            placeholder="Add a description..."
          />
        </div>

        <div className="config-panel__divider" />

        {/* ─── Type-specific fields ─── */}

        {/* Trigger Node */}
        {selectedNode.data.nodeType === "trigger" && (
          <TriggerConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Text Node */}
        {selectedNode.data.nodeType === "text" && (
          <TextConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Button Node */}
        {selectedNode.data.nodeType === "button" && (
          <ButtonConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Media Node */}
        {selectedNode.data.nodeType === "media" && (
          <MediaConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Card Node */}
        {selectedNode.data.nodeType === "card" && (
          <CardConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Carousel Node */}
        {selectedNode.data.nodeType === "carousel" && (
          <CarouselConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Form Node */}
        {selectedNode.data.nodeType === "form" && (
          <FormConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Condition Node */}
        {selectedNode.data.nodeType === "condition" && (
          <ConditionConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Switch Node */}
        {selectedNode.data.nodeType === "switch" && (
          <SwitchConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Input Node */}
        {selectedNode.data.nodeType === "inputRequest" && (
          <InputConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Delay Node */}
        {selectedNode.data.nodeType === "delay" && (
          <DelayConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Random Split Node */}
        {selectedNode.data.nodeType === "randomSplit" && (
          <RandomSplitConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Loop Node */}
        {selectedNode.data.nodeType === "loop" && (
          <LoopConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* End Node */}
        {selectedNode.data.nodeType === "end" && (
          <EndConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* HTTP Request Node */}
        {selectedNode.data.nodeType === "httpRequest" && (
          <HttpRequestConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* AI Prompt Node */}
        {selectedNode.data.nodeType === "aiPrompt" && (
          <AiPromptConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Database Action Node */}
        {selectedNode.data.nodeType === "databaseAction" && (
          <DatabaseActionConfig
            data={selectedNode.data}
            onUpdate={handleUpdate}
          />
        )}

        {/* Save Variable Node */}
        {selectedNode.data.nodeType === "saveVariable" && (
          <SaveVariableConfig
            data={selectedNode.data}
            onUpdate={handleUpdate}
          />
        )}

        {/* Send Email Node */}
        {selectedNode.data.nodeType === "sendEmail" && (
          <SendEmailConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Notification Node */}
        {selectedNode.data.nodeType === "notification" && (
          <NotificationConfig
            data={selectedNode.data}
            onUpdate={handleUpdate}
          />
        )}

        {/* Assign Agent Node */}
        {selectedNode.data.nodeType === "assignAgent" && (
          <AssignAgentConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Approval Request Node */}
        {selectedNode.data.nodeType === "approvalRequest" && (
          <ApprovalRequestConfig
            data={selectedNode.data}
            onUpdate={handleUpdate}
          />
        )}

        {/* Human Takeover Node */}
        {selectedNode.data.nodeType === "humanTakeover" && (
          <HumanTakeoverConfig
            data={selectedNode.data}
            onUpdate={handleUpdate}
          />
        )}

        {/* Notes Node */}
        {selectedNode.data.nodeType === "notes" && (
          <NotesConfig data={selectedNode.data} onUpdate={handleUpdate} />
        )}

        {/* Generic unconfigured state */}
        {![
          "trigger",
          "text",
          "button",
          "media",
          "card",
          "carousel",
          "form",
          "condition",
          "switch",
          "inputRequest",
          "delay",
          "randomSplit",
          "loop",
          "end",
          "httpRequest",
          "aiPrompt",
          "databaseAction",
          "saveVariable",
          "sendEmail",
          "notification",
          "assignAgent",
          "approvalRequest",
          "humanTakeover",
          "notes",
        ].includes(selectedNode.data.nodeType) && (
          <div className="config-panel__placeholder">
            <span className="config-panel__placeholder-icon">⚙️</span>
            <p className="config-panel__placeholder-text">
              Configuration for <strong>{selectedNode.data.label}</strong> will
              be available soon.
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

// ─── Trigger Config ───
const TriggerConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Trigger Type</label>
      <select
        className="config-field__select"
        value={data.triggerType || "manual"}
        onChange={(e) => onUpdate("triggerType", e.target.value)}
      >
        <option value="manual">Manual</option>
        <option value="keyword">Keyword</option>
        <option value="schedule">Schedule</option>
        <option value="api">API</option>
        <option value="webhook">Webhook</option>
      </select>
    </div>
    {data.triggerType === "keyword" && (
      <div className="config-field">
        <label className="config-field__label">Keyword</label>
        <input
          type="text"
          className="config-field__input"
          value={data.config?.keyword || ""}
          onChange={(e) =>
            onUpdate("config", { ...data.config, keyword: e.target.value })
          }
          placeholder="e.g. hello, start, help"
        />
      </div>
    )}
    <div className="config-panel__tip">
      <span>💡</span>
      <span>
        This is the entry point of your flow. Every flow needs exactly one
        trigger.
      </span>
    </div>
  </>
);

// ─── Text Config ───
const TextConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Message</label>
      <textarea
        className="config-field__textarea"
        value={data.message || ""}
        onChange={(e) => onUpdate("message", e.target.value)}
        placeholder="Type your message here..."
        rows={4}
      />
      <span className="config-field__hint">
        Use {"{{variable}}"} to insert dynamic values
      </span>
    </div>
  </>
);

// ─── Button Config ───
const ButtonConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => {
  const buttons = data.buttons || [];

  const addButton = () => {
    const newBtn = {
      id: `btn_${Date.now()}`,
      label: `Option ${buttons.length + 1}`,
      value: `option_${buttons.length + 1}`,
      type: "reply",
    };
    onUpdate("buttons", [...buttons, newBtn]);
  };

  const removeButton = (idx: number) => {
    onUpdate(
      "buttons",
      buttons.filter((_: any, i: number) => i !== idx),
    );
  };

  const updateButton = (idx: number, field: string, value: string) => {
    const updated = buttons.map((b: any, i: number) =>
      i === idx ? { ...b, [field]: value } : b,
    );
    onUpdate("buttons", updated);
  };

  return (
    <>
      <div className="config-field">
        <label className="config-field__label">Message</label>
        <textarea
          className="config-field__textarea"
          value={data.message || ""}
          onChange={(e) => onUpdate("message", e.target.value)}
          placeholder="Please choose an option:"
          rows={2}
        />
      </div>
      <div className="config-field">
        <label className="config-field__label">Buttons</label>
        <div className="config-buttons">
          {buttons.map((btn: any, idx: number) => (
            <div key={btn.id || idx} className="config-button-item">
              <input
                type="text"
                className="config-field__input config-field__input--sm"
                value={btn.label}
                onChange={(e) => updateButton(idx, "label", e.target.value)}
                placeholder="Button label"
              />
              <button
                className="config-button-remove"
                onClick={() => removeButton(idx)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          <button className="config-button-add" onClick={addButton}>
            + Add Button
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Media Config ───
const MediaConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => {
  const mediaType = data.mediaType || "image";
  const showPlayback = mediaType === "video" || mediaType === "audio";

  return (
    <>
      <div className="config-field">
        <label className="config-field__label">Media Type</label>
        <select
          className="config-field__select"
          value={mediaType}
          onChange={(e) => onUpdate("mediaType", e.target.value)}
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="file">File</option>
        </select>
      </div>
      <div className="config-field">
        <label className="config-field__label">Media URL</label>
        <input
          type="text"
          className="config-field__input"
          value={data.url || ""}
          onChange={(e) => onUpdate("url", e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="config-field">
        <label className="config-field__label">Caption</label>
        <textarea
          className="config-field__textarea"
          value={data.caption || ""}
          onChange={(e) => onUpdate("caption", e.target.value)}
          placeholder="Add a short caption..."
          rows={3}
        />
      </div>
      {mediaType === "image" && (
        <div className="config-field">
          <label className="config-field__label">Alt Text</label>
          <input
            type="text"
            className="config-field__input"
            value={data.altText || ""}
            onChange={(e) => onUpdate("altText", e.target.value)}
            placeholder="Describe the image"
          />
        </div>
      )}
      {showPlayback && (
        <div className="config-field">
          <label className="config-field__label">Playback</label>
          <div className="config-checkbox-group">
            <label className="config-checkbox">
              <input
                type="checkbox"
                checked={Boolean(data.autoplay)}
                onChange={(e) => onUpdate("autoplay", e.target.checked)}
              />
              <span>Autoplay</span>
            </label>
            <label className="config-checkbox">
              <input
                type="checkbox"
                checked={Boolean(data.loop)}
                onChange={(e) => onUpdate("loop", e.target.checked)}
              />
              <span>Loop</span>
            </label>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Card Config ───
const CardConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => {
  const buttons = data.buttons || [];

  const addButton = () => {
    const newBtn = {
      id: `card_btn_${Date.now()}`,
      label: `Action ${buttons.length + 1}`,
      value: `action_${buttons.length + 1}`,
      type: "reply",
    };
    onUpdate("buttons", [...buttons, newBtn]);
  };

  const updateButton = (idx: number, field: string, value: string) => {
    const updated = buttons.map((b: any, i: number) =>
      i === idx ? { ...b, [field]: value } : b,
    );
    onUpdate("buttons", updated);
  };

  const removeButton = (idx: number) => {
    onUpdate(
      "buttons",
      buttons.filter((_: any, i: number) => i !== idx),
    );
  };

  return (
    <>
      <div className="config-field">
        <label className="config-field__label">Title</label>
        <input
          type="text"
          className="config-field__input"
          value={data.title || ""}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Card title"
        />
      </div>
      <div className="config-field">
        <label className="config-field__label">Subtitle</label>
        <input
          type="text"
          className="config-field__input"
          value={data.subtitle || ""}
          onChange={(e) => onUpdate("subtitle", e.target.value)}
          placeholder="Optional subtitle"
        />
      </div>
      <div className="config-field">
        <label className="config-field__label">Image URL</label>
        <input
          type="text"
          className="config-field__input"
          value={data.imageUrl || ""}
          onChange={(e) => onUpdate("imageUrl", e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="config-field">
        <label className="config-field__label">Body</label>
        <textarea
          className="config-field__textarea"
          value={data.body || ""}
          onChange={(e) => onUpdate("body", e.target.value)}
          placeholder="Describe the card content..."
          rows={3}
        />
      </div>
      <div className="config-field">
        <label className="config-field__label">Layout</label>
        <select
          className="config-field__select"
          value={data.layout || "vertical"}
          onChange={(e) => onUpdate("layout", e.target.value)}
        >
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
        </select>
      </div>
      <div className="config-field">
        <label className="config-field__label">Buttons</label>
        <div className="config-rules">
          {buttons.map((btn: any, idx: number) => (
            <div key={btn.id || idx} className="config-rule-item">
              <input
                type="text"
                className="config-field__input config-field__input--sm"
                value={btn.label}
                onChange={(e) => updateButton(idx, "label", e.target.value)}
                placeholder="Label"
              />
              <input
                type="text"
                className="config-field__input config-field__input--sm"
                value={btn.value}
                onChange={(e) => updateButton(idx, "value", e.target.value)}
                placeholder="Value"
              />
              <select
                className="config-field__select config-field__select--sm"
                value={btn.type}
                onChange={(e) => updateButton(idx, "type", e.target.value)}
              >
                <option value="reply">Reply</option>
                <option value="url">URL</option>
                <option value="action">Action</option>
              </select>
              <button
                className="config-button-remove"
                onClick={() => removeButton(idx)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          <button className="config-button-add" onClick={addButton}>
            + Add Button
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Carousel Config ───
const CarouselConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => {
  const cards = data.cards || [];

  const addCard = () => {
    const newCard = {
      id: `carousel_${Date.now()}`,
      title: `Card ${cards.length + 1}`,
      subtitle: "",
      body: "",
      imageUrl: "",
      buttons: [],
    };
    onUpdate("cards", [...cards, newCard]);
  };

  const updateCard = (idx: number, field: string, value: any) => {
    const updated = cards.map((c: any, i: number) =>
      i === idx ? { ...c, [field]: value } : c,
    );
    onUpdate("cards", updated);
  };

  const removeCard = (idx: number) => {
    onUpdate(
      "cards",
      cards.filter((_: any, i: number) => i !== idx),
    );
  };

  const updateCardButton = (
    cardIdx: number,
    btnIdx: number,
    field: string,
    value: string,
  ) => {
    const updated = cards.map((c: any, i: number) => {
      if (i !== cardIdx) return c;
      const buttons = c.buttons || [];
      const next = buttons.map((b: any, j: number) =>
        j === btnIdx ? { ...b, [field]: value } : b,
      );
      return { ...c, buttons: next };
    });
    onUpdate("cards", updated);
  };

  const addCardButton = (cardIdx: number) => {
    const updated = cards.map((c: any, i: number) => {
      if (i !== cardIdx) return c;
      const buttons = c.buttons || [];
      const next = [
        ...buttons,
        {
          id: `carousel_btn_${Date.now()}`,
          label: `Action ${buttons.length + 1}`,
          value: `action_${buttons.length + 1}`,
          type: "reply",
        },
      ];
      return { ...c, buttons: next };
    });
    onUpdate("cards", updated);
  };

  const removeCardButton = (cardIdx: number, btnIdx: number) => {
    const updated = cards.map((c: any, i: number) => {
      if (i !== cardIdx) return c;
      const buttons = c.buttons || [];
      return {
        ...c,
        buttons: buttons.filter((_: any, j: number) => j !== btnIdx),
      };
    });
    onUpdate("cards", updated);
  };

  return (
    <>
      <div className="config-field">
        <label className="config-field__label">Carousel</label>
        <div className="config-card-list">
          {cards.map((card: any, idx: number) => (
            <div key={card.id || idx} className="config-card-item">
              <div className="config-card-item__header">
                <span className="config-card-item__title">Card {idx + 1}</span>
                <button
                  className="config-card-item__remove"
                  onClick={() => removeCard(idx)}
                  title="Remove card"
                >
                  ✕
                </button>
              </div>
              <div className="config-field">
                <label className="config-field__label">Title</label>
                <input
                  type="text"
                  className="config-field__input"
                  value={card.title || ""}
                  onChange={(e) => updateCard(idx, "title", e.target.value)}
                />
              </div>
              <div className="config-field">
                <label className="config-field__label">Subtitle</label>
                <input
                  type="text"
                  className="config-field__input"
                  value={card.subtitle || ""}
                  onChange={(e) => updateCard(idx, "subtitle", e.target.value)}
                />
              </div>
              <div className="config-field">
                <label className="config-field__label">Image URL</label>
                <input
                  type="text"
                  className="config-field__input"
                  value={card.imageUrl || ""}
                  onChange={(e) => updateCard(idx, "imageUrl", e.target.value)}
                />
              </div>
              <div className="config-field">
                <label className="config-field__label">Body</label>
                <textarea
                  className="config-field__textarea"
                  value={card.body || ""}
                  onChange={(e) => updateCard(idx, "body", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="config-field">
                <label className="config-field__label">Buttons</label>
                <div className="config-rules">
                  {(card.buttons || []).map((btn: any, btnIdx: number) => (
                    <div key={btn.id || btnIdx} className="config-rule-item">
                      <input
                        type="text"
                        className="config-field__input config-field__input--sm"
                        value={btn.label}
                        onChange={(e) =>
                          updateCardButton(idx, btnIdx, "label", e.target.value)
                        }
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        className="config-field__input config-field__input--sm"
                        value={btn.value}
                        onChange={(e) =>
                          updateCardButton(idx, btnIdx, "value", e.target.value)
                        }
                        placeholder="Value"
                      />
                      <select
                        className="config-field__select config-field__select--sm"
                        value={btn.type}
                        onChange={(e) =>
                          updateCardButton(idx, btnIdx, "type", e.target.value)
                        }
                      >
                        <option value="reply">Reply</option>
                        <option value="url">URL</option>
                        <option value="action">Action</option>
                      </select>
                      <button
                        className="config-button-remove"
                        onClick={() => removeCardButton(idx, btnIdx)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    className="config-button-add"
                    onClick={() => addCardButton(idx)}
                  >
                    + Add Button
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button className="config-button-add" onClick={addCard}>
            + Add Card
          </button>
        </div>
      </div>
      <div className="config-field">
        <label className="config-field__label">Autoplay</label>
        <div className="config-checkbox-group">
          <label className="config-checkbox">
            <input
              type="checkbox"
              checked={Boolean(data.autoplay)}
              onChange={(e) => onUpdate("autoplay", e.target.checked)}
            />
            <span>Auto-scroll cards</span>
          </label>
          <label className="config-checkbox">
            <input
              type="checkbox"
              checked={Boolean(data.loop)}
              onChange={(e) => onUpdate("loop", e.target.checked)}
            />
            <span>Loop carousel</span>
          </label>
        </div>
      </div>
    </>
  );
};

// ─── Form Config ───
const FormConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => {
  const fields = data.fields || [];

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: "Field",
      name: `field_${fields.length + 1}`,
      type: "text",
      required: false,
      placeholder: "",
      options: [],
    };
    onUpdate("fields", [...fields, newField]);
  };

  const updateField = (idx: number, field: string, value: any) => {
    const updated = fields.map((f: any, i: number) =>
      i === idx ? { ...f, [field]: value } : f,
    );
    onUpdate("fields", updated);
  };

  const removeField = (idx: number) => {
    onUpdate(
      "fields",
      fields.filter((_: any, i: number) => i !== idx),
    );
  };

  return (
    <>
      <div className="config-field">
        <label className="config-field__label">Form Title</label>
        <input
          type="text"
          className="config-field__input"
          value={data.title || ""}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Form title"
        />
      </div>
      <div className="config-field">
        <label className="config-field__label">Description</label>
        <textarea
          className="config-field__textarea"
          value={data.description || ""}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Explain what you need from the user..."
          rows={3}
        />
      </div>
      <div className="config-field">
        <label className="config-field__label">Fields</label>
        <div className="config-rules">
          {fields.map((field: any, idx: number) => (
            <div key={field.id || idx} className="config-card-item">
              <div className="config-card-item__header">
                <span className="config-card-item__title">Field {idx + 1}</span>
                <button
                  className="config-card-item__remove"
                  onClick={() => removeField(idx)}
                  title="Remove field"
                >
                  ✕
                </button>
              </div>
              <div className="config-field">
                <label className="config-field__label">Label</label>
                <input
                  type="text"
                  className="config-field__input"
                  value={field.label || ""}
                  onChange={(e) => updateField(idx, "label", e.target.value)}
                />
              </div>
              <div className="config-field">
                <label className="config-field__label">Name</label>
                <input
                  type="text"
                  className="config-field__input"
                  value={field.name || ""}
                  onChange={(e) => updateField(idx, "name", e.target.value)}
                />
              </div>
              <div className="config-field">
                <label className="config-field__label">Type</label>
                <select
                  className="config-field__select"
                  value={field.type || "text"}
                  onChange={(e) => updateField(idx, "type", e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="phone">Phone</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                  <option value="textarea">Textarea</option>
                </select>
              </div>
              <div className="config-field">
                <label className="config-field__label">Placeholder</label>
                <input
                  type="text"
                  className="config-field__input"
                  value={field.placeholder || ""}
                  onChange={(e) =>
                    updateField(idx, "placeholder", e.target.value)
                  }
                />
              </div>
              {field.type === "select" && (
                <div className="config-field">
                  <label className="config-field__label">Options</label>
                  <input
                    type="text"
                    className="config-field__input"
                    value={(field.options || []).join(", ")}
                    onChange={(e) =>
                      updateField(
                        idx,
                        "options",
                        e.target.value
                          .split(",")
                          .map((v) => v.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="Option A, Option B"
                  />
                </div>
              )}
              <div className="config-field">
                <label className="config-field__label">Required</label>
                <label className="config-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(field.required)}
                    onChange={(e) =>
                      updateField(idx, "required", e.target.checked)
                    }
                  />
                  <span>Required field</span>
                </label>
              </div>
            </div>
          ))}
          <button className="config-button-add" onClick={addField}>
            + Add Field
          </button>
        </div>
      </div>
      <div className="config-field">
        <label className="config-field__label">Submit Button</label>
        <input
          type="text"
          className="config-field__input"
          value={data.submitLabel || ""}
          onChange={(e) => onUpdate("submitLabel", e.target.value)}
          placeholder="Submit"
        />
      </div>
    </>
  );
};

// ─── Condition Config ───
const ConditionConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => {
  const rules = data.rules || [];

  const addRule = () => {
    const newRule = {
      id: `rule_${Date.now()}`,
      field: "",
      operator: "equals",
      value: "",
    };
    onUpdate("rules", [...rules, newRule]);
  };

  const updateRule = (idx: number, field: string, value: string) => {
    const updated = rules.map((r: any, i: number) =>
      i === idx ? { ...r, [field]: value } : r,
    );
    onUpdate("rules", updated);
  };

  const removeRule = (idx: number) => {
    onUpdate(
      "rules",
      rules.filter((_: any, i: number) => i !== idx),
    );
  };

  return (
    <>
      <div className="config-field">
        <label className="config-field__label">Combinator</label>
        <select
          className="config-field__select"
          value={data.combinator || "and"}
          onChange={(e) => onUpdate("combinator", e.target.value)}
        >
          <option value="and">All conditions (AND)</option>
          <option value="or">Any condition (OR)</option>
        </select>
      </div>
      <div className="config-field">
        <label className="config-field__label">Rules</label>
        <div className="config-rules">
          {rules.map((rule: any, idx: number) => (
            <div key={rule.id || idx} className="config-rule-item">
              <input
                type="text"
                className="config-field__input config-field__input--sm"
                value={rule.field}
                onChange={(e) => updateRule(idx, "field", e.target.value)}
                placeholder="Variable"
              />
              <select
                className="config-field__select config-field__select--sm"
                value={rule.operator}
                onChange={(e) => updateRule(idx, "operator", e.target.value)}
              >
                <option value="equals">equals</option>
                <option value="notEquals">not equals</option>
                <option value="contains">contains</option>
                <option value="greaterThan">greater than</option>
                <option value="lessThan">less than</option>
                <option value="exists">exists</option>
                <option value="notExists">not exists</option>
              </select>
              <input
                type="text"
                className="config-field__input config-field__input--sm"
                value={rule.value}
                onChange={(e) => updateRule(idx, "value", e.target.value)}
                placeholder="Value"
              />
              <button
                className="config-button-remove"
                onClick={() => removeRule(idx)}
              >
                ✕
              </button>
            </div>
          ))}
          <button className="config-button-add" onClick={addRule}>
            + Add Rule
          </button>
        </div>
      </div>
      <div className="config-panel__tip">
        <span>💡</span>
        <span>
          Connect the <strong>Yes</strong> (left) and <strong>No</strong>{" "}
          (right) outputs to different paths.
        </span>
      </div>
    </>
  );
};

// ─── Switch Config ───
const SwitchConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => {
  const cases = data.cases || [];

  const addCase = () => {
    const newCase = {
      id: `case_${Date.now()}`,
      value: `value_${cases.length + 1}`,
      label: `Case ${cases.length + 1}`,
    };
    onUpdate("cases", [...cases, newCase]);
  };

  const updateCase = (idx: number, field: string, value: string) => {
    const updated = cases.map((c: any, i: number) =>
      i === idx ? { ...c, [field]: value } : c,
    );
    onUpdate("cases", updated);
  };

  const removeCase = (idx: number) => {
    onUpdate(
      "cases",
      cases.filter((_: any, i: number) => i !== idx),
    );
  };

  return (
    <>
      <div className="config-field">
        <label className="config-field__label">Switch Variable</label>
        <input
          type="text"
          className="config-field__input"
          value={data.variable || ""}
          onChange={(e) => onUpdate("variable", e.target.value)}
          placeholder="status"
        />
      </div>
      <div className="config-field">
        <label className="config-field__label">Cases</label>
        <div className="config-rules">
          {cases.map((item: any, idx: number) => (
            <div key={item.id || idx} className="config-rule-item">
              <input
                type="text"
                className="config-field__input config-field__input--sm"
                value={item.label}
                onChange={(e) => updateCase(idx, "label", e.target.value)}
                placeholder="Label"
              />
              <input
                type="text"
                className="config-field__input config-field__input--sm"
                value={item.value}
                onChange={(e) => updateCase(idx, "value", e.target.value)}
                placeholder="Value"
              />
              <button
                className="config-button-remove"
                onClick={() => removeCase(idx)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          <button className="config-button-add" onClick={addCase}>
            + Add Case
          </button>
        </div>
      </div>
      <div className="config-field">
        <label className="config-field__label">Default Label</label>
        <input
          type="text"
          className="config-field__input"
          value={data.defaultCaseLabel || ""}
          onChange={(e) => onUpdate("defaultCaseLabel", e.target.value)}
          placeholder="Default"
        />
      </div>
    </>
  );
};

// ─── Input Config ───
const InputConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Prompt Message</label>
      <textarea
        className="config-field__textarea"
        value={data.prompt || ""}
        onChange={(e) => onUpdate("prompt", e.target.value)}
        placeholder="What would you like to ask?"
        rows={3}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Save Response As</label>
      <input
        type="text"
        className="config-field__input"
        value={data.variableName || ""}
        onChange={(e) => onUpdate("variableName", e.target.value)}
        placeholder="e.g. user_name, email"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Input Type</label>
      <select
        className="config-field__select"
        value={data.inputType || "text"}
        onChange={(e) => onUpdate("inputType", e.target.value)}
      >
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="email">Email</option>
        <option value="phone">Phone</option>
        <option value="date">Date</option>
        <option value="select">Selection</option>
      </select>
    </div>
  </>
);

// ─── Delay Config ───
const DelayConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Wait Duration</label>
      <div className="config-field__row">
        <input
          type="number"
          className="config-field__input config-field__input--number"
          value={data.duration || 5}
          onChange={(e) => onUpdate("duration", parseInt(e.target.value) || 0)}
          min={0}
        />
        <select
          className="config-field__select"
          value={data.unit || "seconds"}
          onChange={(e) => onUpdate("unit", e.target.value)}
        >
          <option value="seconds">Seconds</option>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
      </div>
    </div>
  </>
);

// ─── Random Split Config ───
const RandomSplitConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => {
  const branches = data.branches || [];

  const addBranch = () => {
    const newBranch = {
      id: `branch_${Date.now()}`,
      label: `Path ${branches.length + 1}`,
      percentage: 50,
    };
    onUpdate("branches", [...branches, newBranch]);
  };

  const updateBranch = (idx: number, field: string, value: any) => {
    const updated = branches.map((b: any, i: number) =>
      i === idx ? { ...b, [field]: value } : b,
    );
    onUpdate("branches", updated);
  };

  const removeBranch = (idx: number) => {
    onUpdate(
      "branches",
      branches.filter((_: any, i: number) => i !== idx),
    );
  };

  return (
    <>
      <div className="config-field">
        <label className="config-field__label">Branches</label>
        <div className="config-rules">
          {branches.map((branch: any, idx: number) => (
            <div key={branch.id || idx} className="config-rule-item">
              <input
                type="text"
                className="config-field__input config-field__input--sm"
                value={branch.label}
                onChange={(e) => updateBranch(idx, "label", e.target.value)}
                placeholder="Label"
              />
              <input
                type="number"
                className="config-field__input config-field__input--sm"
                value={branch.percentage ?? 0}
                onChange={(e) =>
                  updateBranch(idx, "percentage", parseInt(e.target.value) || 0)
                }
                min={0}
                max={100}
              />
              <span className="config-field__suffix">%</span>
              <button
                className="config-button-remove"
                onClick={() => removeBranch(idx)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          <button className="config-button-add" onClick={addBranch}>
            + Add Branch
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Loop Config ───
const LoopConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => {
  const loopType = data.loopType || "count";

  return (
    <>
      <div className="config-field">
        <label className="config-field__label">Loop Type</label>
        <select
          className="config-field__select"
          value={loopType}
          onChange={(e) => onUpdate("loopType", e.target.value)}
        >
          <option value="count">Fixed Count</option>
          <option value="until">Until Condition</option>
        </select>
      </div>
      {loopType === "count" && (
        <div className="config-field">
          <label className="config-field__label">Iterations</label>
          <input
            type="number"
            className="config-field__input config-field__input--number"
            value={data.iterations || 1}
            onChange={(e) =>
              onUpdate("iterations", parseInt(e.target.value) || 0)
            }
            min={1}
          />
        </div>
      )}
      {loopType === "until" && (
        <div className="config-field">
          <label className="config-field__label">Stop Condition</label>
          <input
            type="text"
            className="config-field__input"
            value={data.condition || ""}
            onChange={(e) => onUpdate("condition", e.target.value)}
            placeholder="status == 'done'"
          />
        </div>
      )}
      <div className="config-field">
        <label className="config-field__label">Max Iterations</label>
        <input
          type="number"
          className="config-field__input config-field__input--number"
          value={data.maxIterations || 0}
          onChange={(e) =>
            onUpdate("maxIterations", parseInt(e.target.value) || 0)
          }
          min={0}
        />
        <span className="config-field__hint">0 means no limit</span>
      </div>
      <div className="config-field">
        <label className="config-field__label">Delay Between Loops (sec)</label>
        <input
          type="number"
          className="config-field__input config-field__input--number"
          value={data.delaySeconds || 0}
          onChange={(e) =>
            onUpdate("delaySeconds", parseInt(e.target.value) || 0)
          }
          min={0}
        />
      </div>
    </>
  );
};

// ─── End Config ───
const EndConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">End Action</label>
      <select
        className="config-field__select"
        value={data.endType || "complete"}
        onChange={(e) => onUpdate("endType", e.target.value)}
      >
        <option value="complete">Complete Flow</option>
        <option value="redirect">Redirect to Another Flow</option>
        <option value="restart">Restart Flow</option>
      </select>
    </div>
  </>
);

// ─── HTTP Request Config ───
const HttpRequestConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Method</label>
      <select
        className="config-field__select"
        value={data.method || "GET"}
        onChange={(e) => onUpdate("method", e.target.value)}
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATCH">PATCH</option>
      </select>
    </div>
    <div className="config-field">
      <label className="config-field__label">URL</label>
      <input
        type="text"
        className="config-field__input"
        value={data.url || ""}
        onChange={(e) => onUpdate("url", e.target.value)}
        placeholder="https://api.example.com/endpoint"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Request Body</label>
      <textarea
        className="config-field__textarea config-field__textarea--code"
        value={data.body || ""}
        onChange={(e) => onUpdate("body", e.target.value)}
        placeholder='{"key": "value"}'
        rows={4}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Save Response As</label>
      <input
        type="text"
        className="config-field__input"
        value={data.responseVariable || ""}
        onChange={(e) => onUpdate("responseVariable", e.target.value)}
        placeholder="response"
      />
    </div>
  </>
);

// ─── Database Action Config ───
const DatabaseActionConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Action</label>
      <select
        className="config-field__select"
        value={data.action || "query"}
        onChange={(e) => onUpdate("action", e.target.value)}
      >
        <option value="query">Query</option>
        <option value="insert">Insert</option>
        <option value="update">Update</option>
        <option value="delete">Delete</option>
      </select>
    </div>
    <div className="config-field">
      <label className="config-field__label">Table / Collection</label>
      <input
        type="text"
        className="config-field__input"
        value={data.resource || ""}
        onChange={(e) => onUpdate("resource", e.target.value)}
        placeholder="customers"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Filter / Query</label>
      <textarea
        className="config-field__textarea config-field__textarea--code"
        value={data.filter || ""}
        onChange={(e) => onUpdate("filter", e.target.value)}
        placeholder="{ status: 'active' }"
        rows={3}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Data Payload</label>
      <textarea
        className="config-field__textarea config-field__textarea--code"
        value={data.data || ""}
        onChange={(e) => onUpdate("data", e.target.value)}
        placeholder="{ name: 'Alice' }"
        rows={3}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Save Result As</label>
      <input
        type="text"
        className="config-field__input"
        value={data.resultVariable || ""}
        onChange={(e) => onUpdate("resultVariable", e.target.value)}
        placeholder="db_result"
      />
    </div>
  </>
);

// ─── AI Prompt Config ───
const AiPromptConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">AI Prompt</label>
      <textarea
        className="config-field__textarea"
        value={data.prompt || ""}
        onChange={(e) => onUpdate("prompt", e.target.value)}
        placeholder="Describe what the AI should do..."
        rows={5}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Model</label>
      <select
        className="config-field__select"
        value={data.model || "gpt-4"}
        onChange={(e) => onUpdate("model", e.target.value)}
      >
        <option value="gpt-4">GPT-4</option>
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        <option value="claude-3">Claude 3</option>
        <option value="gemini-pro">Gemini Pro</option>
      </select>
    </div>
    <div className="config-field">
      <label className="config-field__label">
        Temperature ({data.temperature || 0.7})
      </label>
      <input
        type="range"
        className="config-field__range"
        value={data.temperature || 0.7}
        onChange={(e) => onUpdate("temperature", parseFloat(e.target.value))}
        min={0}
        max={1}
        step={0.1}
      />
      <div className="config-field__range-labels">
        <span>Precise</span>
        <span>Creative</span>
      </div>
    </div>
    <div className="config-field">
      <label className="config-field__label">Save Response As</label>
      <input
        type="text"
        className="config-field__input"
        value={data.responseVariable || ""}
        onChange={(e) => onUpdate("responseVariable", e.target.value)}
        placeholder="ai_response"
      />
    </div>
  </>
);

// ─── Save Variable Config ───
const SaveVariableConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Variable Name</label>
      <input
        type="text"
        className="config-field__input"
        value={data.variableName || ""}
        onChange={(e) => onUpdate("variableName", e.target.value)}
        placeholder="e.g. user_score"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Value Type</label>
      <select
        className="config-field__select"
        value={data.valueType || "static"}
        onChange={(e) => onUpdate("valueType", e.target.value)}
      >
        <option value="static">Static Value</option>
        <option value="expression">Expression</option>
        <option value="fromPrevious">From Previous Step</option>
      </select>
    </div>
    <div className="config-field">
      <label className="config-field__label">Value</label>
      <input
        type="text"
        className="config-field__input"
        value={data.value || ""}
        onChange={(e) => onUpdate("value", e.target.value)}
        placeholder="Enter value..."
      />
    </div>
  </>
);

// ─── Send Email Config ───
const SendEmailConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">To</label>
      <input
        type="text"
        className="config-field__input"
        value={data.to || ""}
        onChange={(e) => onUpdate("to", e.target.value)}
        placeholder="recipient@example.com"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Subject</label>
      <input
        type="text"
        className="config-field__input"
        value={data.subject || ""}
        onChange={(e) => onUpdate("subject", e.target.value)}
        placeholder="Email subject"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Body</label>
      <textarea
        className="config-field__textarea"
        value={data.body || ""}
        onChange={(e) => onUpdate("body", e.target.value)}
        placeholder="Email content..."
        rows={5}
      />
    </div>
  </>
);

// ─── Notification Config ───
const NotificationConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Channel</label>
      <select
        className="config-field__select"
        value={data.channel || "inApp"}
        onChange={(e) => onUpdate("channel", e.target.value)}
      >
        <option value="inApp">In-App</option>
        <option value="push">Push</option>
        <option value="email">Email</option>
        <option value="sms">SMS</option>
      </select>
    </div>
    <div className="config-field">
      <label className="config-field__label">Title</label>
      <input
        type="text"
        className="config-field__input"
        value={data.title || ""}
        onChange={(e) => onUpdate("title", e.target.value)}
        placeholder="Notification title"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Message</label>
      <textarea
        className="config-field__textarea"
        value={data.message || ""}
        onChange={(e) => onUpdate("message", e.target.value)}
        placeholder="Write the notification content..."
        rows={3}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Target</label>
      <input
        type="text"
        className="config-field__input"
        value={data.target || ""}
        onChange={(e) => onUpdate("target", e.target.value)}
        placeholder="user_id"
      />
    </div>
  </>
);

// ─── Assign Agent Config ───
const AssignAgentConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Assignment Type</label>
      <select
        className="config-field__select"
        value={data.assignmentType || "roundRobin"}
        onChange={(e) => onUpdate("assignmentType", e.target.value)}
      >
        <option value="roundRobin">Round Robin</option>
        <option value="leastBusy">Least Busy</option>
        <option value="specific">Specific Agent</option>
        <option value="skill">By Skill</option>
      </select>
    </div>
    {data.assignmentType === "specific" && (
      <div className="config-field">
        <label className="config-field__label">Agent ID</label>
        <input
          type="text"
          className="config-field__input"
          value={data.agentId || ""}
          onChange={(e) => onUpdate("agentId", e.target.value)}
          placeholder="agent_123"
        />
      </div>
    )}
    {data.assignmentType === "skill" && (
      <div className="config-field">
        <label className="config-field__label">Skill</label>
        <input
          type="text"
          className="config-field__input"
          value={data.skill || ""}
          onChange={(e) => onUpdate("skill", e.target.value)}
          placeholder="billing"
        />
      </div>
    )}
  </>
);

// ─── Approval Request Config ───
const ApprovalRequestConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Approver Group</label>
      <input
        type="text"
        className="config-field__input"
        value={data.approverGroup || ""}
        onChange={(e) => onUpdate("approverGroup", e.target.value)}
        placeholder="managers"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Message</label>
      <textarea
        className="config-field__textarea"
        value={data.message || ""}
        onChange={(e) => onUpdate("message", e.target.value)}
        placeholder="Please review and approve..."
        rows={3}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Timeout (minutes)</label>
      <input
        type="number"
        className="config-field__input config-field__input--number"
        value={data.timeoutMinutes || 0}
        onChange={(e) =>
          onUpdate("timeoutMinutes", parseInt(e.target.value) || 0)
        }
        min={0}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">On Timeout</label>
      <select
        className="config-field__select"
        value={data.onTimeout || "escalate"}
        onChange={(e) => onUpdate("onTimeout", e.target.value)}
      >
        <option value="autoApprove">Auto-Approve</option>
        <option value="autoReject">Auto-Reject</option>
        <option value="escalate">Escalate</option>
      </select>
    </div>
    {data.onTimeout === "escalate" && (
      <div className="config-field">
        <label className="config-field__label">Escalation Target</label>
        <input
          type="text"
          className="config-field__input"
          value={data.escalationTarget || ""}
          onChange={(e) => onUpdate("escalationTarget", e.target.value)}
          placeholder="team_lead"
        />
      </div>
    )}
  </>
);

// ─── Human Takeover Config ───
const HumanTakeoverConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Queue</label>
      <input
        type="text"
        className="config-field__input"
        value={data.queue || ""}
        onChange={(e) => onUpdate("queue", e.target.value)}
        placeholder="support"
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Priority</label>
      <select
        className="config-field__select"
        value={data.priority || "normal"}
        onChange={(e) => onUpdate("priority", e.target.value)}
      >
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>
    </div>
    <div className="config-field">
      <label className="config-field__label">Handoff Message</label>
      <textarea
        className="config-field__textarea"
        value={data.handoffMessage || ""}
        onChange={(e) => onUpdate("handoffMessage", e.target.value)}
        placeholder="A human agent will join shortly..."
        rows={3}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Fallback Message</label>
      <textarea
        className="config-field__textarea"
        value={data.fallbackMessage || ""}
        onChange={(e) => onUpdate("fallbackMessage", e.target.value)}
        placeholder="No agents available right now..."
        rows={3}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Transcript</label>
      <label className="config-checkbox">
        <input
          type="checkbox"
          checked={Boolean(data.includeTranscript)}
          onChange={(e) => onUpdate("includeTranscript", e.target.checked)}
        />
        <span>Include transcript in handoff</span>
      </label>
    </div>
  </>
);

// ─── Notes Config ───
const NotesConfig: React.FC<{
  data: any;
  onUpdate: (f: string, v: any) => void;
}> = ({ data, onUpdate }) => (
  <>
    <div className="config-field">
      <label className="config-field__label">Note Content</label>
      <textarea
        className="config-field__textarea"
        value={data.content || ""}
        onChange={(e) => onUpdate("content", e.target.value)}
        placeholder="Write your note here..."
        rows={6}
      />
    </div>
    <div className="config-field">
      <label className="config-field__label">Color</label>
      <div className="config-color-grid">
        {["#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3", "#f3e8ff", "#e0e7ff"].map(
          (c) => (
            <button
              key={c}
              className={`config-color-swatch ${data.color === c ? "config-color-swatch--active" : ""}`}
              style={{ background: c }}
              onClick={() => onUpdate("color", c)}
            />
          ),
        )}
      </div>
    </div>
  </>
);

export default ConfigPanel;
