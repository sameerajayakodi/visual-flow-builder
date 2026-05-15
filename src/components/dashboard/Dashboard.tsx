import React from 'react';

// ─── Hardcoded demo data ───
const STATS = [
  { label: 'Total Sessions', value: '2,847', change: '+12.5%', up: true, icon: '📊', color: '#10b981' },
  { label: 'Completed', value: '1,923', change: '+8.3%', up: true, icon: '✅', color: '#3b82f6' },
  { label: 'Abandoned', value: '634', change: '-5.1%', up: false, icon: '🚪', color: '#ef4444' },
  { label: 'Completion Rate', value: '67.5%', change: '+3.2%', up: true, icon: '🎯', color: '#f59e0b' },
  { label: 'Avg. Duration', value: '2m 34s', change: '-12s', up: true, icon: '⏱️', color: '#8b5cf6' },
  { label: 'Active Flows', value: '6', change: '+2', up: true, icon: '🔄', color: '#ec4899' },
];

const DAILY_DATA = [
  { day: 'Mon', sessions: 145, completed: 98, abandoned: 32 },
  { day: 'Tue', sessions: 189, completed: 134, abandoned: 38 },
  { day: 'Wed', sessions: 156, completed: 108, abandoned: 28 },
  { day: 'Thu', sessions: 210, completed: 152, abandoned: 41 },
  { day: 'Fri', sessions: 234, completed: 168, abandoned: 45 },
  { day: 'Sat', sessions: 178, completed: 125, abandoned: 35 },
  { day: 'Sun', sessions: 120, completed: 82, abandoned: 26 },
];

const PLATFORM_DATA = [
  { name: 'WhatsApp', sessions: 1245, pct: 43.7, color: '#25D366', icon: '📱' },
  { name: 'Web Widget', sessions: 856, pct: 30.1, color: '#6366f1', icon: '🌐' },
  { name: 'Messenger', sessions: 489, pct: 17.2, color: '#0084FF', icon: '💬' },
  { name: 'Instagram', sessions: 257, pct: 9.0, color: '#E1306C', icon: '📸' },
];

const FLOW_PERFORMANCE = [
  { name: 'Customer Support', sessions: 892, rate: 78, avgTime: '1m 45s', trend: '+5%' },
  { name: 'Lead Qualification', sessions: 645, rate: 62, avgTime: '3m 12s', trend: '+12%' },
  { name: 'Appointment Booking', sessions: 534, rate: 71, avgTime: '2m 08s', trend: '+3%' },
  { name: 'Product FAQ', sessions: 412, rate: 85, avgTime: '1m 22s', trend: '-2%' },
  { name: 'Feedback Collection', sessions: 234, rate: 58, avgTime: '4m 15s', trend: '+8%' },
  { name: 'Onboarding', sessions: 130, rate: 44, avgTime: '5m 30s', trend: '+15%' },
];

const TOP_VARIABLES = [
  { name: 'user_name', captures: 2134, fill: 92 },
  { name: 'email', captures: 1876, fill: 81 },
  { name: 'phone', captures: 1654, fill: 71 },
  { name: 'company_name', captures: 1245, fill: 54 },
  { name: 'service_type', captures: 1102, fill: 48 },
  { name: 'budget', captures: 934, fill: 40 },
];

const DROP_OFFS = [
  { node: 'Get Email', pct: 28, color: '#ef4444' },
  { node: 'Budget Range', pct: 22, color: '#f59e0b' },
  { node: 'Get Phone', pct: 18, color: '#f97316' },
  { node: 'Requirement Details', pct: 15, color: '#eab308' },
  { node: 'Contact Time', pct: 10, color: '#84cc16' },
  { node: 'Confirm Details', pct: 7, color: '#10b981' },
];

const RECENT_ACTIVITY = [
  { flow: 'Customer Support', platform: 'whatsapp', status: 'completed', time: '2m ago', user: 'John D.' },
  { flow: 'Lead Qualification', platform: 'web', status: 'completed', time: '5m ago', user: 'Sarah M.' },
  { flow: 'Appointment Booking', platform: 'messenger', status: 'abandoned', time: '8m ago', user: 'Mike R.' },
  { flow: 'Product FAQ', platform: 'instagram', status: 'completed', time: '12m ago', user: 'Lisa K.' },
  { flow: 'Customer Support', platform: 'whatsapp', status: 'completed', time: '15m ago', user: 'Alex T.' },
  { flow: 'Feedback Collection', platform: 'web', status: 'abandoned', time: '18m ago', user: 'Emma W.' },
  { flow: 'Lead Qualification', platform: 'whatsapp', status: 'completed', time: '22m ago', user: 'David L.' },
  { flow: 'Onboarding', platform: 'messenger', status: 'in_progress', time: '25m ago', user: 'Rachel B.' },
];

const HOURLY = [18, 12, 8, 5, 3, 6, 15, 32, 48, 52, 58, 63, 55, 60, 65, 58, 52, 45, 38, 32, 28, 25, 22, 20];

const platformIcons: Record<string, string> = { whatsapp: '📱', web: '🌐', messenger: '💬', instagram: '📸' };
const statusColors: Record<string, { bg: string; text: string }> = {
  completed: { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
  abandoned: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
  in_progress: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
};

const Dashboard: React.FC = () => {
  const maxDaily = Math.max(...DAILY_DATA.map(d => d.sessions));
  const maxHourly = Math.max(...HOURLY);

  return (
    <div className="dash">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-h1">Dashboard</h1>
          <p className="dash-h1-sub">Real-time analytics for your chatbot flows</p>
        </div>
        <div className="dash-header-right">
          <span className="dash-live-dot" />
          <span className="dash-live-text">Live</span>
          <select className="dash-period-select">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dash-stats-row">
        {STATS.map((s) => (
          <div key={s.label} className="dash-stat">
            <div className="dash-stat-top">
              <span className="dash-stat-emoji">{s.icon}</span>
              <span className={`dash-stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span>
            </div>
            <div className="dash-stat-val">{s.value}</div>
            <div className="dash-stat-lbl">{s.label}</div>
            <div className="dash-stat-bar" style={{ background: s.color + '20' }}>
              <div className="dash-stat-bar-fill" style={{ background: s.color, width: '70%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Daily chart + Platform donut + Hourly heat */}
      <div className="dash-row dash-row--3">
        {/* Daily Sessions */}
        <div className="dash-card dash-card--2col">
          <div className="dash-card-head">
            <h3>Sessions This Week</h3>
            <div className="dash-card-legend">
              <span className="dash-legend-dot" style={{ background: '#10b981' }} /> Completed
              <span className="dash-legend-dot" style={{ background: '#ef4444' }} /> Abandoned
            </div>
          </div>
          <div className="dash-chart-bars">
            {DAILY_DATA.map((d) => (
              <div key={d.day} className="dash-bar-col">
                <div className="dash-bar-stack" style={{ height: `${(d.sessions / maxDaily) * 100}%` }}>
                  <div className="dash-bar-segment dash-bar-segment--abandoned" style={{ height: `${(d.abandoned / d.sessions) * 100}%` }} />
                  <div className="dash-bar-segment dash-bar-segment--completed" style={{ height: `${(d.completed / d.sessions) * 100}%` }} />
                </div>
                <span className="dash-bar-val">{d.sessions}</span>
                <span className="dash-bar-day">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="dash-card">
          <div className="dash-card-head"><h3>Platform Split</h3></div>
          <div className="dash-platform-list">
            {PLATFORM_DATA.map((p) => (
              <div key={p.name} className="dash-platform-row">
                <span className="dash-platform-icon">{p.icon}</span>
                <div className="dash-platform-info">
                  <div className="dash-platform-top">
                    <span className="dash-platform-name">{p.name}</span>
                    <span className="dash-platform-num">{p.sessions.toLocaleString()}</span>
                  </div>
                  <div className="dash-platform-track">
                    <div className="dash-platform-fill" style={{ width: `${p.pct}%`, background: p.color }} />
                  </div>
                  <span className="dash-platform-pct">{p.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Flow performance + Variables + Drop-offs */}
      <div className="dash-row dash-row--3">
        {/* Flow Performance Table */}
        <div className="dash-card dash-card--2col">
          <div className="dash-card-head"><h3>Flow Performance</h3></div>
          <table className="dash-table">
            <thead>
              <tr><th>Flow</th><th>Sessions</th><th>Completion</th><th>Avg Time</th><th>Trend</th></tr>
            </thead>
            <tbody>
              {FLOW_PERFORMANCE.map((f) => (
                <tr key={f.name}>
                  <td className="dash-td-name">{f.name}</td>
                  <td>{f.sessions}</td>
                  <td>
                    <div className="dash-rate-wrap">
                      <div className="dash-rate-track">
                        <div className="dash-rate-fill" style={{ width: `${f.rate}%`, background: f.rate > 70 ? '#10b981' : f.rate > 50 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <span className="dash-rate-num">{f.rate}%</span>
                    </div>
                  </td>
                  <td className="dash-td-time">{f.avgTime}</td>
                  <td><span className={`dash-trend ${f.trend.startsWith('+') ? 'up' : 'down'}`}>{f.trend}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column: Variables + Drop-offs stacked */}
        <div className="dash-stack">
          {/* Top Variables */}
          <div className="dash-card">
            <div className="dash-card-head"><h3>Top Variables</h3></div>
            <div className="dash-var-list">
              {TOP_VARIABLES.map((v) => (
                <div key={v.name} className="dash-var-row">
                  <code className="dash-var-name">{v.name}</code>
                  <div className="dash-var-bar">
                    <div className="dash-var-fill" style={{ width: `${v.fill}%` }} />
                  </div>
                  <span className="dash-var-num">{v.captures.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Drop-off Points */}
          <div className="dash-card">
            <div className="dash-card-head"><h3>Drop-off Points</h3></div>
            <div className="dash-drop-list">
              {DROP_OFFS.map((d) => (
                <div key={d.node} className="dash-drop-row">
                  <span className="dash-drop-node">{d.node}</span>
                  <div className="dash-drop-bar">
                    <div className="dash-drop-fill" style={{ width: `${d.pct * 3}%`, background: d.color }} />
                  </div>
                  <span className="dash-drop-pct">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Hourly heatmap + Recent Activity */}
      <div className="dash-row dash-row--2">
        {/* Hourly Activity */}
        <div className="dash-card">
          <div className="dash-card-head"><h3>Hourly Activity (Today)</h3></div>
          <div className="dash-hourly">
            {HOURLY.map((v, i) => (
              <div key={i} className="dash-hourly-col">
                <div
                  className="dash-hourly-bar"
                  style={{ height: `${(v / maxHourly) * 100}%`, opacity: 0.3 + (v / maxHourly) * 0.7 }}
                  title={`${i}:00 — ${v} sessions`}
                />
                {i % 3 === 0 && <span className="dash-hourly-label">{i}h</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dash-card">
          <div className="dash-card-head"><h3>Recent Activity</h3></div>
          <div className="dash-activity">
            {RECENT_ACTIVITY.map((a, i) => {
              const sc = statusColors[a.status] || statusColors.completed;
              return (
                <div key={i} className="dash-act-row">
                  <span className="dash-act-icon">{platformIcons[a.platform] || '▶️'}</span>
                  <div className="dash-act-info">
                    <span className="dash-act-user">{a.user}</span>
                    <span className="dash-act-flow">{a.flow}</span>
                  </div>
                  <span className="dash-act-badge" style={{ background: sc.bg, color: sc.text }}>
                    {a.status.replace('_', ' ')}
                  </span>
                  <span className="dash-act-time">{a.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
