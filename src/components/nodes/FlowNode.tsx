// ─── FlowNode ───
// Each node with answers/buttons shows labeled output handles.
// Arrows from each answer connect to the next prompt — no condition nodes needed.

import React, { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { getNodeColor } from '../../constants';
import { nodePreviewRegistry, resolveValue } from '../../config';
import { useFlowStore } from '../../store';
import type { FlowNodeData, NotesNodeData } from '../../types';

// ─── Helper: get dynamic outputs from any node ───
function getDynamicOutputs(data: FlowNodeData): { id: string; label: string }[] | null {
  const d = data as any;

  // Questionnaire (Prompt): answers → outputs (max 10)
  if (d.nodeType === 'questionnaire' && d.answers?.length > 0) {
    if (d.promptProps?.includes('ENDING') || d.promptProps?.includes('TEXT')) return null;
    const limited = d.answers.slice(0, 10);
    return limited.map((a: any, i: number) => ({ id: a.id || `ans_${i}`, label: a.text }));
  }


  // Card node: each button → output
  if (d.nodeType === 'card' && d.buttons?.length > 0) {
    return d.buttons.map((b: any) => ({ id: b.id, label: b.label }));
  }

  // Condition node (switch mode): each case -> output + default -> output
  if (d.nodeType === 'condition' && d.conditionType === 'switch' && d.cases?.length > 0) {
    const outputs = d.cases.map((c: any) => ({ id: c.id, label: c.label || c.value }));
    outputs.push({ id: 'default', label: 'Default' });
    return outputs;
  }

  return null;
}

// ─── Answer Handles Bar: shows labels ABOVE each handle ───
const AnswerHandlesBar: React.FC<{ outputs: { id: string; label: string }[] }> = ({ outputs }) => {
  return (
    <div className="flow-node__answers-bar">
      {outputs.map((output, i) => {
        return (
          <div
            key={output.id}
            className="flow-node__answer-slot"
          >
            <span className="flow-node__answer-label">{output.label}</span>
            <Handle
              type="source"
              position={Position.Bottom}
              className="flow-handle flow-handle--source flow-handle--answer"
              id={output.id}
            />
          </div>
        );
      })}
    </div>
  );
};

// ─── Question text preview ───
const QuestionPreview: React.FC<{ data: any }> = ({ data }) => {
  const text = data.text || data.message || '';
  if (!text) return null;
  const maxLen = 80;
  return (
    <div className="flow-node__question-text">
      "{text.slice(0, maxLen)}{text.length > maxLen ? '...' : ''}"
    </div>
  );
};

// ─── Fallback preview for non-choice nodes ───
const FallbackPreview: React.FC<{ data: FlowNodeData }> = ({ data }) => {
  const config = nodePreviewRegistry[data.nodeType];
  if (!config) return null;

  switch (config.type) {
    case 'text': {
      const text = (data as any)[config.textKey || 'message'] as string;
      if (!text) return null;
      const maxLen = config.textMaxLength || 60;
      return (
        <div className="flow-node__preview">
          {text.slice(0, maxLen)}{text.length > maxLen ? '...' : ''}
        </div>
      );
    }
    case 'stats': {
      if (!config.stats) return null;
      return (
        <div className={`flow-node__preview flow-node__preview--stats ${config.previewClass || ''}`}>
          {config.stats.map((stat, i) => {
            const raw = resolveValue(data, stat.valueKey);
            const display = stat.format
              ? (stat.format as any)(raw, data)
              : (raw != null ? String(raw) : stat.fallback || '-');
            return (
              <div key={i} className="flow-node__stat">
                <span className="flow-node__stat-label">{stat.label}</span>
                <span className="flow-node__stat-value">{display}</span>
              </div>
            );
          })}
        </div>
      );
    }
    case 'condition': {
      if ((data as any).conditionType === 'switch') {
        const variable = (data as any).variable || 'Unknown Variable';
        return (
          <div className="flow-node__preview">
            Check: {variable}
          </div>
        );
      }
      const rules = (data as any).rules ?? [];
      const combinator = String((data as any).combinator ?? 'and');
      return (
        <div className="flow-node__preview flow-node__preview--condition">
          <div className="flow-node__condition-row">
            <span className="flow-node__condition-label">IF</span>
            <span className="flow-node__condition-text">{rules.length ? `${rules.length} rule${rules.length === 1 ? '' : 's'}` : 'No rules'}</span>
            <span className="flow-node__condition-chip">{combinator.toUpperCase()}</span>
          </div>
          <div className="flow-node__condition-branches">
            <span className="flow-node__branch flow-node__branch--yes">✓ Yes</span>
            <span className="flow-node__branch flow-node__branch--no">✗ No</span>
          </div>
        </div>
      );
    }
    case 'getInput': {
      const type = (data as any).expectedInputType || 'image';
      const msg = (data as any).message || '';
      const variable = (data as any).saveToVariable || '';
      const skippable = (data as any).skippable || false;
      const icons: Record<string, string> = { image: '🖼️', video: '🎥', audio: '🎙️', file: '📄' };
      return (
        <div className="flow-node__preview flow-node__preview--get-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 10px' }}>
          {msg && (
            <div className="flow-node__question-text" style={{ marginTop: 0, padding: '4px 8px', fontSize: '11px' }}>
              "{msg}"
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '8px', 
            background: 'var(--bg-card)', 
            padding: '8px 12px', 
            borderRadius: '6px',
            border: '1px dashed var(--node-color)',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '16px' }}>
              {icons[type] || '📎'}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Expects {type}
            </div>
          </div>
          
          {(variable || skippable) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              {variable && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>
                  <span>💾</span> {variable}
                </div>
              )}
              {skippable && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>
                  <span>⏭️</span> Skip allowed
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    default:
      return null;
  }
};

const FlowNodeComponent: React.FC<NodeProps<FlowNodeData>> = ({ id, data, selected }) => {
  const selectNode = useFlowStore((s) => s.selectNode);
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const duplicateNode = useFlowStore((s) => s.duplicateNode);

  const color = getNodeColor(data.nodeType);
  const isEnd = data.nodeType === 'end';
  const isTrigger = data.nodeType === 'trigger';
  const isNotes = data.nodeType === 'notes';
  const isConditionRules = data.nodeType === 'condition' && (data as any).conditionType !== 'switch';
  const showConfigStatus = !isNotes && !isTrigger && !isEnd;

  const statusTone = data.hasError ? 'error' : (showConfigStatus && !data.isConfigured) ? 'warn' : 'ready';
  const statusLabel = data.hasError ? 'Error' : (showConfigStatus && !data.isConfigured) ? 'Needs setup' : 'Ready';

  const notesColor = isNotes ? (data as NotesNodeData).color : undefined;
  const dynamicOutputs = getDynamicOutputs(data);
  const hasDynamic = dynamicOutputs && dynamicOutputs.length > 0;

  // Questionnaire metadata
  const qData = data.nodeType === 'questionnaire' ? (data as any) : null;
  const isEnding = qData?.promptProps?.includes('ENDING');

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(id);
  }, [id, selectNode]);

  return (
    <div
      onClick={handleClick}
      className={`flow-node flow-node--wide ${selected ? 'flow-node--selected' : ''} ${data.hasError ? 'flow-node--error' : ''} ${isNotes ? 'flow-node--notes' : ''} ${isConditionRules ? 'flow-node--condition' : ''} ${hasDynamic ? 'flow-node--has-outputs' : ''}`}
      style={{
        '--node-color': color,
        '--node-color-light': color + '18',
        '--node-color-medium': color + '40',
        '--node-surface': notesColor ?? 'var(--bg-card)',
      } as React.CSSProperties}
    >
      {/* Incoming handle */}
      {!isTrigger && (
        <Handle type="target" position={Position.Top} className="flow-handle flow-handle--target" id="target" />
      )}

      {/* Node body */}
      <div className="flow-node__body">
        {/* Header */}
        <div className="flow-node__header">
          <span className="flow-node__icon-wrap">
            <span className="flow-node__icon">{data.icon}</span>
          </span>
          <div className="flow-node__info">
            <div className="flow-node__title-row">
              <span className="flow-node__label">{data.label}</span>
              {qData && qData.language && qData.language !== 'ENGLISH' && (
                <span className="flow-node__pindex-badge">{qData.language}</span>
              )}
              <span className={`flow-node__status flow-node__status--${statusTone}`}>
                {statusLabel}
              </span>
            </div>
            <div className="flow-node__meta">
              {qData && qData.promptProps?.[0] && (
                <span className="flow-node__category">{qData.promptProps[0]}</span>
              )}
              {!qData && (
                <span className="flow-node__category">{data.category}</span>
              )}
              {isEnding && <span className="flow-node__ending-badge">🏁 END</span>}
            </div>
          </div>
        </div>

        {/* Question / Message text — only for questionnaire or nodes with dynamic outputs */}
        {(qData || hasDynamic) && <QuestionPreview data={data} />}

        {/* Fallback preview for plain nodes (text, delay, httpRequest, etc.) */}
        {!hasDynamic && !qData && <FallbackPreview data={data} />}
      </div>

      {/* ─── Answer labels + handles bar ─── */}
      {hasDynamic && <AnswerHandlesBar outputs={dynamicOutputs!} />}

      {/* Single output handle for non-choice nodes */}
      {!isEnd && !hasDynamic && !isConditionRules && !isEnding && (
        <Handle type="source" position={Position.Bottom} className="flow-handle flow-handle--source" id="source" />
      )}

      {/* Condition: Yes/No handles */}
      {isConditionRules && (
        <>
          <Handle type="source" position={Position.Bottom} className="flow-handle flow-handle--source flow-handle--yes" id="yes" style={{ left: '30%' }} />
          <Handle type="source" position={Position.Bottom} className="flow-handle flow-handle--source flow-handle--no" id="no" style={{ left: '70%' }} />
        </>
      )}

      {/* Quick actions */}
      {selected && !isTrigger && (
        <div className="flow-node__actions">
          <button className="flow-node__action-btn" onClick={(e) => { e.stopPropagation(); duplicateNode(id); }} title="Duplicate">
            <svg className="flow-node__action-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M8 7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2v-2h2V7h-7v2H8V7zm-3 3a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7zm2 0v7h7v-7H7z" /></svg>
          </button>
          <button className="flow-node__action-btn flow-node__action-btn--delete" onClick={(e) => { e.stopPropagation(); deleteNode(id); }} title="Delete">
            <svg className="flow-node__action-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9z" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(FlowNodeComponent);
