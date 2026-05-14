import React, { useMemo, useEffect } from 'react';
import { useFlowStore } from '../../store';

const DebugPanel: React.FC = () => {
  const showDebugPanel = useFlowStore((s) => s.showDebugPanel);
  const showJsonPreview = useFlowStore((s) => s.showJsonPreview);
  const toggleDebugPanel = useFlowStore((s) => s.toggleDebugPanel);
  const toggleJsonPreview = useFlowStore((s) => s.toggleJsonPreview);
  const validationErrors = useFlowStore((s) => s.validationErrors);
  const exportFlow = useFlowStore((s) => s.exportFlow);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const selectNode = useFlowStore((s) => s.selectNode);

  const [activeTab, setActiveTab] = React.useState<'validation' | 'json' | 'stats'>('validation');

  // Auto-switch to validation tab when errors are present
  useEffect(() => {
    if (validationErrors.length > 0 && showDebugPanel) {
      setActiveTab('validation');
    }
  }, [validationErrors, showDebugPanel]);

  const flowJson = useMemo(() => {
    if (!showDebugPanel && !showJsonPreview) return '';
    try {
      const doc = exportFlow();
      const cleanExport = {
        flowId: doc.flowId,
        name: doc.name,
        version: doc.version,
        status: doc.status,
        prompts: doc.prompts,
        steps: doc.steps,
        metadata: doc.metadata
      };
      return JSON.stringify(cleanExport, null, 2);
    } catch {
      return '{}';
    }
  }, [nodes, edges, showDebugPanel, showJsonPreview, exportFlow]);

  // Show JSON preview as a modal overlay
  if (showJsonPreview && !showDebugPanel) {
    return (
      <div className="json-preview-overlay">
        <div className="json-preview-modal">
          <div className="json-preview-modal__header">
            <h3>Flow JSON</h3>
            <button
              className="json-preview-modal__close"
              onClick={toggleJsonPreview}
            >
              ✕
            </button>
          </div>
          <pre className="json-preview-modal__content">{flowJson}</pre>
          <div className="json-preview-modal__footer">
            <button
              className="json-preview-modal__copy"
              onClick={() => {
                navigator.clipboard.writeText(flowJson);
              }}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showDebugPanel) return null;

  // Compute counts
  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;
  const infoCount = validationErrors.filter(e => e.severity === 'info').length;

  const stepNodes = nodes.filter(n => n.data.nodeType !== 'notes');
  const configuredCount = stepNodes.filter(n => n.data.isConfigured).length;
  const questionnaireCount = stepNodes.filter(n => n.data.nodeType === 'questionnaire').length;
  const endingCount = stepNodes.filter(n => {
    const d = n.data as any;
    return d.nodeType === 'end' || (d.nodeType === 'questionnaire' && d.promptProps?.includes('ENDING'));
  }).length;

  return (
    <div className="debug-panel">
      <div className="debug-panel__header">
        <div className="debug-panel__tabs">
          <button
            className={`debug-panel__tab ${activeTab === 'validation' ? 'debug-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('validation')}
          >
            Validation
            {validationErrors.length > 0 && (
              <span className="debug-panel__tab-badge">{validationErrors.length}</span>
            )}
          </button>
          <button
            className={`debug-panel__tab ${activeTab === 'json' ? 'debug-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            JSON
          </button>
          <button
            className={`debug-panel__tab ${activeTab === 'stats' ? 'debug-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </button>
        </div>
        <button className="debug-panel__close" onClick={toggleDebugPanel}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7L7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="debug-panel__content">
        {activeTab === 'validation' && (
          <div className="debug-panel__validation">
            {validationErrors.length === 0 ? (
              <div className="debug-panel__empty">
                <span>✅</span>
                <span>No validation issues. Click "Validate" in the toolbar to check.</span>
              </div>
            ) : (
              <>
                {/* Summary bar */}
                <div className="debug-panel__summary" style={{
                  display: 'flex', gap: '12px', padding: '8px 12px', marginBottom: '8px',
                  background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600
                }}>
                  {errorCount > 0 && <span style={{ color: 'var(--danger)' }}>❌ {errorCount} error{errorCount > 1 ? 's' : ''}</span>}
                  {warningCount > 0 && <span style={{ color: 'var(--warning)' }}>⚠️ {warningCount} warning{warningCount > 1 ? 's' : ''}</span>}
                  {infoCount > 0 && <span style={{ color: 'var(--accent)' }}>ℹ️ {infoCount} suggestion{infoCount > 1 ? 's' : ''}</span>}
                </div>

                <div className="debug-panel__error-list">
                  {validationErrors.map((err, i) => (
                    <div
                      key={i}
                      className={`debug-panel__error debug-panel__error--${err.severity}`}
                      onClick={() => err.nodeId && selectNode(err.nodeId)}
                      style={{ cursor: err.nodeId ? 'pointer' : 'default' }}
                    >
                      <span className="debug-panel__error-icon">
                        {err.severity === 'error' ? '❌' : err.severity === 'warning' ? '⚠️' : 'ℹ️'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="debug-panel__error-msg">{err.message}</span>
                        {err.field && (
                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Field: {err.field}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <pre className="debug-panel__json">{flowJson}</pre>
        )}

        {activeTab === 'stats' && (
          <div className="debug-panel__stats">
            <div className="debug-panel__stat">
              <span className="debug-panel__stat-label">Total Nodes</span>
              <span className="debug-panel__stat-value">{nodes.length}</span>
            </div>
            <div className="debug-panel__stat">
              <span className="debug-panel__stat-label">Step Nodes</span>
              <span className="debug-panel__stat-value">{stepNodes.length}</span>
            </div>
            <div className="debug-panel__stat">
              <span className="debug-panel__stat-label">Connections</span>
              <span className="debug-panel__stat-value">{edges.length}</span>
            </div>
            <div className="debug-panel__stat">
              <span className="debug-panel__stat-label">Triggers</span>
              <span className="debug-panel__stat-value">
                {nodes.filter((n) => n.data.nodeType === 'trigger').length}
              </span>
            </div>
            <div className="debug-panel__stat">
              <span className="debug-panel__stat-label">Questionnaires</span>
              <span className="debug-panel__stat-value">{questionnaireCount}</span>
            </div>
            <div className="debug-panel__stat">
              <span className="debug-panel__stat-label">End / Ending</span>
              <span className="debug-panel__stat-value">{endingCount}</span>
            </div>
            <div className="debug-panel__stat">
              <span className="debug-panel__stat-label">Configured</span>
              <span className="debug-panel__stat-value">{configuredCount} / {stepNodes.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
