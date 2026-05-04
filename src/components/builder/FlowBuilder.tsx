import React, { useEffect, useCallback } from 'react';
import { NodeSidebar } from '../sidebar';
import { ConfigPanel } from '../panels';
import Topbar from './Topbar';
import FlowCanvas from './FlowCanvas';
import DebugPanel from './DebugPanel';
import { useFlowStore } from '../../store';

const FlowBuilder: React.FC = () => {
  const darkMode = useFlowStore((s) => s.darkMode);
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const duplicateNode = useFlowStore((s) => s.duplicateNode);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const saveFlow = useFlowStore((s) => s.saveFlow);

  // ─── Keyboard shortcuts ───
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      )
        return;

      // Ctrl+Z = Undo
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z = Redo
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        redo();
      }
      // Ctrl+Y = Redo
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      // Delete or Backspace = Delete node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        deleteNode(selectedNodeId);
      }
      // Ctrl+D = Duplicate
      if (e.ctrlKey && e.key === 'd' && selectedNodeId) {
        e.preventDefault();
        duplicateNode(selectedNodeId);
      }
      // Ctrl+S = Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveFlow();
      }
    },
    [undo, redo, deleteNode, duplicateNode, selectedNodeId, saveFlow]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ─── Try to load saved flow from localStorage ───
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flowcraft_current_flow');
      if (saved) {
        const doc = JSON.parse(saved);
        useFlowStore.getState().loadFlow(doc);
      }
    } catch {
      // Ignore load errors
    }
  }, []);

  return (
    <div className={`flow-builder ${darkMode ? 'dark' : ''}`}>
      <Topbar />
      <div className="flow-builder__main">
        <NodeSidebar />
        <div className="flow-builder__canvas-area">
          <FlowCanvas />
          <DebugPanel />
        </div>
        <ConfigPanel />
      </div>
    </div>
  );
};

export default FlowBuilder;
