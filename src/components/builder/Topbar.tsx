import React, { useState, useRef, useEffect } from 'react';
import { useFlowStore } from '../../store';
import { EXAMPLE_FLOWS } from '../../templates/exampleFlows';


const Topbar: React.FC = () => {
  const flowName = useFlowStore((s) => s.flowName);
  const setFlowName = useFlowStore((s) => s.setFlowName);
  const flowStatus = useFlowStore((s) => s.flowStatus);
  const setFlowStatus = useFlowStore((s) => s.setFlowStatus);
  const isDirty = useFlowStore((s) => s.isDirty);
  const lastSaved = useFlowStore((s) => s.lastSaved);
  const saveFlow = useFlowStore((s) => s.saveFlow);
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);
  const darkMode = useFlowStore((s) => s.darkMode);
  const toggleDarkMode = useFlowStore((s) => s.toggleDarkMode);
  const toggleMinimap = useFlowStore((s) => s.toggleMinimap);
  const showMinimap = useFlowStore((s) => s.showMinimap);
  const toggleDebugPanel = useFlowStore((s) => s.toggleDebugPanel);
  const showDebugPanel = useFlowStore((s) => s.showDebugPanel);
  const toggleJsonPreview = useFlowStore((s) => s.toggleJsonPreview);
  const showJsonPreview = useFlowStore((s) => s.showJsonPreview);
  const validateFlow = useFlowStore((s) => s.validateFlow);
  const validationErrors = useFlowStore((s) => s.validationErrors);
  const exportFlow = useFlowStore((s) => s.exportFlow);
  const clearFlow = useFlowStore((s) => s.clearFlow);
  const historyIndex = useFlowStore((s) => s.historyIndex);
  const history = useFlowStore((s) => s.history);
  const loadFlow = useFlowStore((s) => s.loadFlow);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(flowName);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameSubmit = () => {
    if (editName.trim()) {
      setFlowName(editName.trim());
    }
    setIsEditingName(false);
  };

  const handleExportJson = () => {
    const doc = exportFlow();
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flowName.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };


  const handleValidate = () => {
    const errors = validateFlow();
    if (errors.length === 0) {
      alert('✅ Flow is valid! No issues found.');
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved';
    const date = new Date(lastSaved);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Saved just now';
    if (diffMin < 60) return `Saved ${diffMin}m ago`;
    return `Saved at ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="topbar">
      {/* Left section */}
      <div className="topbar__left">
        <div className="topbar__brand">
          <span className="topbar__logo">◈</span>
          <span className="topbar__brand-name">FlowCraft</span>
        </div>

        <div className="topbar__divider" />

        {/* Flow name */}
        <div className="topbar__name-section">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              className="topbar__name-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit();
                if (e.key === 'Escape') {
                  setEditName(flowName);
                  setIsEditingName(false);
                }
              }}
            />
          ) : (
            <button
              className="topbar__name-btn"
              onClick={() => {
                setEditName(flowName);
                setIsEditingName(true);
              }}
              title="Click to rename"
            >
              {flowName}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          <span className="topbar__save-status">
            {isDirty ? (
              <span className="topbar__save-status--unsaved">● Unsaved</span>
            ) : (
              <span className="topbar__save-status--saved">{formatLastSaved()}</span>
            )}
          </span>
        </div>
      </div>

      {/* Center section */}
      <div className="topbar__center">
        {/* Undo/Redo */}
        <div className="topbar__btn-group">
          <button
            className="topbar__icon-btn"
            onClick={undo}
            disabled={historyIndex < 0}
            title="Undo (Ctrl+Z)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H12C13.1 8 14 8.9 14 10V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 5L3 8L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="topbar__icon-btn"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H4C2.9 8 2 8.9 2 10V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 5L13 8L10 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="topbar__divider" />

        {/* View toggles */}
        <button
          className={`topbar__icon-btn ${showMinimap ? 'topbar__icon-btn--active' : ''}`}
          onClick={toggleMinimap}
          title="Toggle minimap"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="8" y="8" width="6" height="6" rx="1" fill="currentColor" opacity="0.3"/>
          </svg>
        </button>

        <button
          className={`topbar__icon-btn ${showJsonPreview ? 'topbar__icon-btn--active' : ''}`}
          onClick={toggleJsonPreview}
          title="Toggle JSON preview"
        >
          {'{ }'}
        </button>

        <button
          className={`topbar__icon-btn ${showDebugPanel ? 'topbar__icon-btn--active' : ''}`}
          onClick={toggleDebugPanel}
          title="Toggle debug panel"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="10" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 12.5H12" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="topbar__divider" />

        {/* Templates */}
        <div className="topbar__menu-wrap">
          <button
            className={`topbar__btn topbar__btn--secondary ${showTemplates ? 'topbar__icon-btn--active' : ''}`}
            onClick={() => setShowTemplates(!showTemplates)}
          >
            📚 Templates
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 4 }}>
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showTemplates && (
            <>
              <div className="topbar__menu-overlay" onClick={() => setShowTemplates(false)} />
              <div className="topbar__menu" style={{ left: 0, right: 'auto', minWidth: 260 }}>
                <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Load Template
                </div>
                {Object.entries(EXAMPLE_FLOWS).map(([key, flow]) => (
                  <button
                    key={key}
                    className="topbar__menu-item"
                    onClick={() => {
                      if (confirm(`Load "${flow.name}"? This will replace your current flow.`)) {
                        loadFlow(flow);
                      }
                      setShowTemplates(false);
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 600 }}>{flow.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'normal', textAlign: 'left', marginTop: 2 }}>
                        {flow.metadata.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="topbar__right">
        {/* Validation */}
        <button
          className="topbar__btn topbar__btn--outline"
          onClick={handleValidate}
          title="Validate flow"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Validate
          {validationErrors.length > 0 && (
            <span className="topbar__badge topbar__badge--error">
              {validationErrors.length}
            </span>
          )}
        </button>

        {/* Dark mode */}
        <button
          className="topbar__icon-btn"
          onClick={toggleDarkMode}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Save */}
        <button
          className="topbar__btn topbar__btn--secondary"
          onClick={saveFlow}
        >
          Save
        </button>

        {/* Menu */}
        <div className="topbar__menu-wrap">
          <button
            className="topbar__icon-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
              <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
              <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="topbar__menu-overlay" onClick={() => setShowMenu(false)} />
              <div className="topbar__menu">
                <button className="topbar__menu-item" onClick={handleExportJson}>
                  📤 Export JSON
                </button>
                <button className="topbar__menu-item" onClick={() => { toggleJsonPreview(); setShowMenu(false); }}>
                  {'{ }'} JSON Preview
                </button>
                <div className="topbar__menu-divider" />
                <button
                  className="topbar__menu-item topbar__menu-item--danger"
                  onClick={() => {
                    if (confirm('Clear entire flow? This cannot be undone.')) {
                      clearFlow();
                    }
                    setShowMenu(false);
                  }}
                >
                  🗑 Clear Flow
                </button>
              </div>
            </>
          )}
        </div>

        {/* Publish */}
        <button
          className="topbar__btn topbar__btn--primary"
          onClick={() => {
            const errors = validateFlow();
            if (errors.filter((e) => e.severity === 'error').length > 0) {
              alert('Please fix all errors before publishing.');
              return;
            }
            setFlowStatus('published');
            saveFlow();
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7L7 1L13 7M7 1V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Publish
        </button>
      </div>
    </div>
  );
};

export default Topbar;
