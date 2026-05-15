import React, { useEffect, useMemo, useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';

// ─── Types ───
interface FlowSummary {
  flowId: string;
  flowName: string;
  totalSessions: number;
  completed: number;
  abandoned: number;
  inProgress: number;
  completionRate: number;
  variableNames: string[];
  lastActivity: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const c: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
    abandoned: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
    in_progress: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  };
  const s = c[status] || c.abandoned;
  return (
    <span className="rpt-badge" style={{ background: s.bg, color: s.text }}>
      {status.replace('_', ' ')}
    </span>
  );
};

const platformIcons: Record<string, string> = {
  whatsapp: '📱', messenger: '💬', instagram: '📸', web: '🌐', simulator: '▶️',
};

const Reporting: React.FC = () => {
  const initialize = useSimulationStore((s) => s.initialize);
  const sessions = useSimulationStore((s) => s.sessions);

  // Drill-down state
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
  const [variableFilters, setVariableFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { initialize(); }, [initialize]);

  // ─── Level 1: Aggregate flows ───
  const flowSummaries: FlowSummary[] = useMemo(() => {
    const map = new Map<string, FlowSummary>();

    sessions.forEach((s) => {
      const key = s.flowId || s.flowName;
      if (!map.has(key)) {
        map.set(key, {
          flowId: s.flowId,
          flowName: s.flowName,
          totalSessions: 0,
          completed: 0,
          abandoned: 0,
          inProgress: 0,
          completionRate: 0,
          variableNames: [],
          lastActivity: s.startedAt,
        });
      }
      const f = map.get(key)!;
      f.totalSessions++;
      if (s.status === 'completed') f.completed++;
      else if (s.status === 'abandoned') f.abandoned++;
      else f.inProgress++;
      if (new Date(s.startedAt) > new Date(f.lastActivity)) f.lastActivity = s.startedAt;

      // Collect unique variable names
      Object.keys(s.variables).forEach((v) => {
        if (!f.variableNames.includes(v)) f.variableNames.push(v);
      });
    });

    map.forEach((f) => {
      f.completionRate = f.totalSessions > 0 ? Math.round((f.completed / f.totalSessions) * 100) : 0;
    });

    return Array.from(map.values()).sort((a, b) => b.totalSessions - a.totalSessions);
  }, [sessions]);

  // ─── Level 2: Sessions for selected flow ───
  const selectedFlow = flowSummaries.find((f) => (f.flowId || f.flowName) === selectedFlowId);

  // Collect unique values per variable (for smart dropdowns vs text inputs)
  const uniqueVarValues = useMemo(() => {
    if (!selectedFlowId) return {} as Record<string, string[]>;
    const allFlowSessions = sessions.filter((s) => (s.flowId || s.flowName) === selectedFlowId);
    const valuesMap: Record<string, Set<string>> = {};

    allFlowSessions.forEach((s) => {
      Object.entries(s.variables).forEach(([key, val]) => {
        if (!valuesMap[key]) valuesMap[key] = new Set();
        if (val && val.trim()) valuesMap[key].add(val.trim());
      });
    });

    const result: Record<string, string[]> = {};
    Object.entries(valuesMap).forEach(([key, set]) => {
      result[key] = Array.from(set).sort();
    });
    return result;
  }, [sessions, selectedFlowId]);

  // Helper: is this variable a "choice" type?
  // We exclude common free-text fields so they don't appear as dropdown filters.
  const isChoiceVar = (varName: string) => {
    const textFields = ['user_name', 'company_name', 'requirement', 'email', 'phone', 'message', 'address'];
    if (textFields.includes(varName)) return false;
    
    const vals = uniqueVarValues[varName];
    return vals && vals.length > 0 && vals.length <= 15;
  };

  const flowSessions = useMemo(() => {
    if (!selectedFlowId) return [];
    return sessions
      .filter((s) => (s.flowId || s.flowName) === selectedFlowId)
      .filter((s) => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchVar = Object.values(s.variables).some((v) => v.toLowerCase().includes(q));
          if (!matchVar) return false;
        }
        // Variable filters
        for (const [key, val] of Object.entries(variableFilters)) {
          if (!val) continue;
          const sessionVal = s.variables[key] || '';
          if (isChoiceVar(key)) {
            // Exact match for dropdown selections
            if (sessionVal !== val) return false;
          } else {
            // Partial match for text inputs
            if (!sessionVal.toLowerCase().includes(val.toLowerCase())) return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [sessions, selectedFlowId, statusFilter, searchQuery, variableFilters, uniqueVarValues]);

  // ─── Level 3: Viewing session ───
  const viewingSession = viewingSessionId ? sessions.find((s) => s.id === viewingSessionId) : null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatShort = (iso: string) =>
    new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // CSV export for current flow sessions
  const exportCSV = () => {
    if (!selectedFlow) return;
    const vars = selectedFlow.variableNames;
    const headers = ['#', 'Date', 'Platform', 'Status', 'Responses', 'Completion %', ...vars];
    const rows = flowSessions.map((s, i) => [
      i + 1,
      formatDate(s.startedAt),
      s.platform,
      s.status,
      s.responses.length,
      s.completionPercentage + '%',
      ...vars.map((v) => `"${(s.variables[v] || '').replace(/"/g, '""')}"`),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFlow.flowName.replace(/\s+/g, '_')}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ═══════════════════════════════════════
  //  LEVEL 3: Chat History View
  // ═══════════════════════════════════════
  if (viewingSession) {
    return (
      <div className="rpt">
        {/* Breadcrumb */}
        <div className="rpt-breadcrumb">
          <button className="rpt-bread-btn" onClick={() => { setViewingSessionId(null); }}>
            ← Back to Sessions
          </button>
          <span className="rpt-bread-sep">/</span>
          <span className="rpt-bread-current">Chat History</span>
        </div>

        {/* Session Header */}
        <div className="rpt-chat-header">
          <div className="rpt-chat-header-left">
            <span className="rpt-chat-platform">{platformIcons[viewingSession.platform] || '▶️'}</span>
            <div>
              <h2 className="rpt-chat-title">{viewingSession.flowName}</h2>
              <p className="rpt-chat-meta">
                {viewingSession.platform} • {formatDate(viewingSession.startedAt)} • {viewingSession.responses.length} responses
              </p>
            </div>
          </div>
          <StatusBadge status={viewingSession.status} />
        </div>

        <div className="rpt-chat-body">
          {/* Variables summary */}
          <div className="rpt-chat-vars">
            <h4>Captured Variables</h4>
            <div className="rpt-chat-vars-grid">
              {Object.keys(viewingSession.variables).length > 0 ? (
                Object.entries(viewingSession.variables).map(([k, v]) => (
                  <div key={k} className="rpt-chat-var-item">
                    <span className="rpt-chat-var-key">{k}</span>
                    <span className="rpt-chat-var-val">{v}</span>
                  </div>
                ))
              ) : (
                <span className="rpt-chat-var-empty">No variables captured</span>
              )}
            </div>
          </div>

          {/* Chat thread */}
          <div className="rpt-chat-thread">
            <h4>Conversation</h4>
            <div className="rpt-chat-messages">
              {viewingSession.responses.map((r, idx) => (
                <div key={idx} className="rpt-chat-pair">
                  <div className="rpt-chat-msg rpt-chat-msg--bot">
                    <div className="rpt-chat-msg-avatar">🤖</div>
                    <div className="rpt-chat-msg-bubble">
                      <p>{r.promptText}</p>
                      <span className="rpt-chat-msg-time">{r.nodeLabel}</span>
                    </div>
                  </div>
                  <div className="rpt-chat-msg rpt-chat-msg--user">
                    <div className="rpt-chat-msg-bubble rpt-chat-msg-bubble--user">
                      <p>{r.userResponse}</p>
                      {r.variableName && <span className="rpt-chat-msg-var">→ {r.variableName}</span>}
                    </div>
                    <div className="rpt-chat-msg-avatar rpt-chat-msg-avatar--user">👤</div>
                  </div>
                </div>
              ))}

              {/* End marker */}
              <div className="rpt-chat-end">
                {viewingSession.status === 'completed' && (
                  <span className="rpt-chat-end-badge rpt-chat-end-badge--success">✅ Flow completed successfully</span>
                )}
                {viewingSession.status === 'abandoned' && (
                  <span className="rpt-chat-end-badge rpt-chat-end-badge--warn">⚠️ User abandoned at: {viewingSession.lastNodeLabel}</span>
                )}
                {viewingSession.status === 'in_progress' && (
                  <span className="rpt-chat-end-badge rpt-chat-end-badge--progress">⏳ Session still in progress</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  LEVEL 2: Flow Sessions Table
  // ═══════════════════════════════════════
  if (selectedFlowId && selectedFlow) {
    const vars = selectedFlow.variableNames;
    const rowsPerPageOptions = [10, 25, 50];
    const totalFiltered = flowSessions.length;
    const totalPages = Math.ceil(totalFiltered / rowsPerPage);
    const startIdx = (page - 1) * rowsPerPage;
    const paginatedSessions = flowSessions.slice(startIdx, startIdx + rowsPerPage);
    const rangeStart = totalFiltered === 0 ? 0 : startIdx + 1;
    const rangeEnd = Math.min(startIdx + rowsPerPage, totalFiltered);

    return (
      <div className="rpt">
        {/* Breadcrumb */}
        <div className="rpt-breadcrumb">
          <button className="rpt-bread-btn" onClick={() => { setSelectedFlowId(null); setVariableFilters({}); setSearchQuery(''); setStatusFilter('all'); setPage(1); }}>
            ← All Flows
          </button>
          <span className="rpt-bread-sep">/</span>
          <span className="rpt-bread-current">{selectedFlow.flowName}</span>
        </div>

        {/* Header */}
        <div className="rpt-lvl2-header">
          <div>
            <h1 className="rpt-title">{selectedFlow.flowName}</h1>
            <p className="rpt-sub">
              {selectedFlow.totalSessions} sessions • {selectedFlow.completionRate}% completion rate
            </p>
          </div>
          <div className="rpt-lvl2-actions">
            <button className="rpt-export-btn" onClick={exportCSV}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Table Card with Toolbar */}
        <div className="rpt-table-wrap">
          {/* MUI-style toolbar inside card */}
          <div className="rpt-toolbar">
            <div className="rpt-toolbar-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
            </div>

            <select className="rpt-toolbar-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
              <option value="in_progress">In Progress</option>
            </select>

            <div className="rpt-toolbar-divider" />

            {vars.map((v) => {
              if (isChoiceVar(v)) {
                return (
                  <select
                    key={v}
                    className="rpt-toolbar-select"
                    value={variableFilters[v] || ''}
                    onChange={(e) => { setVariableFilters((prev) => ({ ...prev, [v]: e.target.value })); setPage(1); }}
                  >
                    <option value="">All {v}</option>
                    {uniqueVarValues[v].map((val) => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                );
              }
              return null;
            })}

            {Object.values(variableFilters).some(Boolean) && (
              <button className="rpt-toolbar-clear" onClick={() => setVariableFilters({})}>Clear</button>
            )}

            <span className="rpt-toolbar-count">{totalFiltered} results</span>
          </div>

          {/* Table */}
          <div className="rpt-table-scroll">
            <table className="rpt-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Responses</th>
                  <th>Completion</th>
                  {vars.map((v) => (
                    <th key={v} className="rpt-th-var">{v}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSessions.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="rpt-td-num">{startIdx + idx + 1}</td>
                    <td className="rpt-td-date">{formatShort(s.startedAt)}</td>
                    <td><span className="rpt-td-platform">{platformIcons[s.platform]} {s.platform}</span></td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className="rpt-td-num">{s.responses.length}</td>
                    <td>
                      <div className="rpt-completion-wrap">
                        <div className="rpt-completion-track">
                          <div className="rpt-completion-fill" style={{ width: `${s.completionPercentage}%`, background: s.completionPercentage >= 100 ? '#10b981' : s.completionPercentage > 50 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className="rpt-completion-num">{s.completionPercentage}%</span>
                      </div>
                    </td>
                    {vars.map((v) => (
                      <td key={v} className="rpt-td-var">{s.variables[v] || <span className="rpt-td-empty">—</span>}</td>
                    ))}
                    <td>
                      <button className="rpt-view-btn" onClick={() => setViewingSessionId(s.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalFiltered === 0 && (
              <div className="rpt-empty">
                <p>No sessions match your filters</p>
              </div>
            )}
          </div>

          {/* MUI-style Pagination */}
          <div className="rpt-pagination">
            <div className="rpt-pagination-info">
              <span>Rows per page:</span>
              <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}>
                {rowsPerPageOptions.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <span className="rpt-pagination-range">
              {rangeStart}–{rangeEnd} of {totalFiltered}
            </span>
            <div className="rpt-pagination-btns">
              <button className="rpt-page-btn" disabled={page <= 1} onClick={() => setPage(1)} title="First page">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
              </button>
              <button className="rpt-page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)} title="Previous page">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button className="rpt-page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)} title="Next page">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              <button className="rpt-page-btn" disabled={page >= totalPages} onClick={() => setPage(totalPages)} title="Last page">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  LEVEL 1: Flows Table
  // ═══════════════════════════════════════
  return (
    <div className="rpt">
      <div className="rpt-header">
        <div>
          <h1 className="rpt-title">Reporting</h1>
          <p className="rpt-sub">Click a flow to view captured session details</p>
        </div>
      </div>

      {flowSummaries.length === 0 ? (
        <div className="rpt-empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <h3>No sessions recorded yet</h3>
          <p>Go to Flow Builder → Run the Simulator → Complete a flow to see data here</p>
        </div>
      ) : (
        <div className="rpt-table-wrap">
          <div className="rpt-table-scroll">
            <table className="rpt-table rpt-table--flows">
              <thead>
                <tr>
                  <th>Flow Name</th>
                  <th>Total Sessions</th>
                  <th>Completed</th>
                  <th>Abandoned</th>
                  <th>In Progress</th>
                  <th>Completion Rate</th>
                  <th>Variables</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {flowSummaries.map((f) => (
                  <tr
                    key={f.flowId || f.flowName}
                    className="rpt-tr-clickable"
                    onClick={() => setSelectedFlowId(f.flowId || f.flowName)}
                  >
                    <td className="rpt-td-flow-name">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 3v18" /><path d="M5 7l7-4 7 4" /><path d="M5 17l7 4 7-4" /></svg>
                      {f.flowName}
                    </td>
                    <td className="rpt-td-num rpt-td-bold">{f.totalSessions}</td>
                    <td className="rpt-td-num" style={{ color: '#10b981' }}>{f.completed}</td>
                    <td className="rpt-td-num" style={{ color: '#ef4444' }}>{f.abandoned}</td>
                    <td className="rpt-td-num" style={{ color: '#f59e0b' }}>{f.inProgress}</td>
                    <td>
                      <div className="rpt-completion-wrap">
                        <div className="rpt-completion-track">
                          <div className="rpt-completion-fill" style={{ width: `${f.completionRate}%`, background: f.completionRate >= 70 ? '#10b981' : f.completionRate >= 50 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className="rpt-completion-num">{f.completionRate}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="rpt-var-tags">
                        {f.variableNames.slice(0, 3).map((v) => (
                          <span key={v} className="rpt-var-tag">{v}</span>
                        ))}
                        {f.variableNames.length > 3 && (
                          <span className="rpt-var-tag rpt-var-tag--more">+{f.variableNames.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="rpt-td-date">{formatShort(f.lastActivity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reporting;
