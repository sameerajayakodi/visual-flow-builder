import React, { useState, useRef, useEffect } from 'react';
import { useFlowStore } from '../../store';
import { importJsonToFlow } from '../../utils/jsonImporter';


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
  const toggleSimulator = useFlowStore((s) => s.toggleSimulator);
  const showSimulator = useFlowStore((s) => s.showSimulator);
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileImportRef = useRef<HTMLInputElement>(null);

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
    // Export full format: includes nodes+edges (for re-import) and prompts
    const fullExport = {
      flowId: doc.flowId,
      name: doc.name,
      version: doc.version,
      nodes: doc.nodes,
      edges: doc.edges,
      prompts: doc.prompts,
      variables: doc.variables,
    };
    const blob = new Blob([JSON.stringify(fullExport, null, 2)], {
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

  const handleImportJson = () => {
    setImportError(null);
    setImportSuccess(null);
    const result = importJsonToFlow(importJson);
    if (!result.success) {
      setImportError(result.error || 'Failed to import JSON.');
      return;
    }
    loadFlow(result.doc);
    setImportSuccess(`✅ Flow imported successfully (${result.format} format). ${result.doc.nodes?.length || 0} nodes loaded.`);
    setTimeout(() => {
      setShowImportModal(false);
      setImportJson('');
      setImportError(null);
      setImportSuccess(null);
    }, 1500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportJson(text);
      setImportError(null);
      setImportSuccess(null);
    };
    reader.readAsText(file);
    e.target.value = '';
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
          <span className="topbar__brand-name">No-Code Flow Builder</span>
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

        <button
          className={`topbar__btn ${showSimulator ? 'topbar__btn--primary' : 'topbar__btn--outline'}`}
          onClick={toggleSimulator}
          title="Simulate Flow"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 6 }}>
            <path d="M2 2L12 7L2 12V2Z" fill="currentColor" />
          </svg>
          Simulate
        </button>

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
                <button className="topbar__menu-item" onClick={() => { setShowImportModal(true); setShowMenu(false); }}>
                  📥 Import JSON
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

      {/* ─── Import JSON Modal ─── */}
      {showImportModal && (
        <div className="import-modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="import-modal" onClick={(e) => e.stopPropagation()}>
            <div className="import-modal__header">
              <h3 className="import-modal__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Import JSON
              </h3>
              <button className="import-modal__close" onClick={() => setShowImportModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="import-modal__body">
              <p className="import-modal__desc">
                Paste your flow JSON below. Supports both <strong>internal format</strong> (nodes + edges) and <strong>prompts format</strong>.
              </p>

              <textarea
                className="import-modal__textarea"
                placeholder='{\n  "prompts": [\n    { "pIndex": 0, "text": "Hello!", ... }\n  ]\n}'
                value={importJson}
                onChange={(e) => { setImportJson(e.target.value); setImportError(null); setImportSuccess(null); }}
                spellCheck={false}
              />

              {importError && (
                <div className="import-modal__error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div className="import-modal__success">
                  {importSuccess}
                </div>
              )}
            </div>

            <div className="import-modal__footer">
              <input
                type="file"
                ref={fileImportRef}
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileImport}
              />
              <button
                className="import-modal__btn import-modal__btn--secondary"
                onClick={() => fileImportRef.current?.click()}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                Load File
              </button>
              <button
                className="import-modal__btn import-modal__btn--primary"
                onClick={handleImportJson}
                disabled={!importJson.trim()}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 16 12 12 8 16"></polyline>
                  <line x1="12" y1="12" x2="12" y2="21"></line>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                </svg>
                Import Flow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;
