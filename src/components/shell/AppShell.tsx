import React, { useEffect, useState, useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useFlowStore } from '../../store';
import { useSimulationStore } from '../../store/simulationStore';
import { NODE_CATEGORIES, getCategoryNodes } from '../../constants';
import type { NodeCategory, NodeLibraryItem } from '../../types';

// ─── Draggable Node Card ───
const NodeCard: React.FC<{
  node: NodeLibraryItem;
  onDragStart: (e: React.DragEvent, type: string) => void;
  collapsed?: boolean;
}> = ({ node, onDragStart, collapsed }) => (
  <div
    className="shell-node-card"
    draggable
    onDragStart={(e) => onDragStart(e, node.type)}
    title={node.description}
  >
    <span className="shell-node-card__icon" style={{ background: node.color + '18', color: node.color }}>
      {node.icon}
    </span>
    {!collapsed && (
      <>
        <span className="shell-node-card__label">{node.label}</span>
        <svg className="shell-node-card__grip" width="8" height="14" viewBox="0 0 8 14" fill="none">
          <circle cx="2" cy="2" r="1" fill="currentColor" />
          <circle cx="6" cy="2" r="1" fill="currentColor" />
          <circle cx="2" cy="7" r="1" fill="currentColor" />
          <circle cx="6" cy="7" r="1" fill="currentColor" />
          <circle cx="2" cy="12" r="1" fill="currentColor" />
          <circle cx="6" cy="12" r="1" fill="currentColor" />
        </svg>
      </>
    )}
  </div>
);

const AppShell: React.FC = () => {
  const darkMode = useFlowStore((s) => s.darkMode);
  const toggleDarkMode = useFlowStore((s) => s.toggleDarkMode);
  const initialize = useSimulationStore((s) => s.initialize);
  const totalSessions = useSimulationStore((s) => s.sessions.length);
  const location = useLocation();
  const isBuilderPage = location.pathname === '/builder';

  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<NodeCategory | null>('trigger');
  const [blockSearch, setBlockSearch] = useState('');

  useEffect(() => { initialize(); }, [initialize]);

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('application/flowcraft-node', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  const filteredBlocks = useMemo(() => {
    if (!blockSearch.trim()) return null;
    const q = blockSearch.toLowerCase();
    const results: NodeLibraryItem[] = [];
    NODE_CATEGORIES.forEach((cat) => {
      getCategoryNodes(cat.id).forEach((node) => {
        if (node.label.toLowerCase().includes(q) || node.description.toLowerCase().includes(q)) {
          results.push(node);
        }
      });
    });
    return results;
  }, [blockSearch]);

  // Nav items
  const navItems = [
    {
      to: '/',
      end: true,
      label: 'Dashboard',
      badge: totalSessions > 0 ? totalSessions : null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      to: '/builder',
      label: 'Flow Builder',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18" /><path d="M5 7l7-4 7 4" /><path d="M5 12l7 4 7-4" /><path d="M5 17l7 4 7-4" />
        </svg>
      ),
    },
    {
      to: '/reporting',
      label: 'Reporting',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      to: '/configuration',
      label: 'Configuration',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`app-shell ${darkMode ? 'dark' : ''}`}>
      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${isBuilderPage ? 'app-sidebar--builder' : ''}`}>
        {/* Brand */}
        <div className="app-sidebar__brand">
          <div className="app-sidebar__logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logo-grad)" />
              <path d="M8 10L14 7L20 10V18L14 21L8 18V10Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
              <circle cx="14" cy="14" r="3" fill="white" opacity="0.8" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#10b981" /><stop offset="1" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {!collapsed && (
            <div className="app-sidebar__brand-text">
              <span className="app-sidebar__brand-name">FlowCraft</span>
              <span className="app-sidebar__brand-sub">Automation Studio</span>
            </div>
          )}
          <button
            className="app-sidebar__collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d={collapsed ? 'M6 3L11 8L6 13' : 'M10 3L5 8L10 13'}
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="app-sidebar__nav">
          {!collapsed && <span className="app-sidebar__nav-label">Main</span>}

          {navItems.map((item, idx) => (
            <React.Fragment key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => `app-sidebar__link ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="app-sidebar__badge">{item.badge}</span>
                )}
              </NavLink>

              {/* Block Library — after Flow Builder link, only on builder page */}
              {item.to === '/builder' && isBuilderPage && !collapsed && (
                <div className="app-sidebar__blocks">
                  <div className="app-sidebar__blocks-header">
                    <span className="app-sidebar__blocks-title">🧩 Blocks</span>
                  </div>
                  <div className="app-sidebar__blocks-search">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search blocks..."
                      value={blockSearch}
                      onChange={(e) => setBlockSearch(e.target.value)}
                    />
                    {blockSearch && (
                      <button className="app-sidebar__blocks-clear" onClick={() => setBlockSearch('')}>✕</button>
                    )}
                  </div>
                  <div className="app-sidebar__blocks-list">
                    {filteredBlocks ? (
                      filteredBlocks.length === 0 ? (
                        <div className="app-sidebar__blocks-empty">No blocks found</div>
                      ) : (
                        filteredBlocks.map((node) => (
                          <NodeCard key={node.type} node={node} onDragStart={handleDragStart} />
                        ))
                      )
                    ) : (
                      NODE_CATEGORIES.map((category) => {
                        const nodes = getCategoryNodes(category.id);
                        const isExpanded = expandedCategory === category.id;
                        return (
                          <div key={category.id} className="app-sidebar__block-cat">
                            <button
                              className={`app-sidebar__block-cat-header ${isExpanded ? 'expanded' : ''}`}
                              onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                            >
                              <span className="app-sidebar__block-cat-icon">{category.icon}</span>
                              <span className="app-sidebar__block-cat-label">{category.label}</span>
                              <span className="app-sidebar__block-cat-count">{nodes.length}</span>
                              <svg className={`app-sidebar__block-cat-arrow ${isExpanded ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            {isExpanded && (
                              <div className="app-sidebar__block-cat-nodes">
                                {nodes.map((node) => (
                                  <NodeCard key={node.type} node={node} onDragStart={handleDragStart} />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Collapsed builder: show mini block icons */}
              {item.to === '/builder' && isBuilderPage && collapsed && (
                <div className="app-sidebar__blocks-mini">
                  {NODE_CATEGORIES.map((cat) => {
                    const nodes = getCategoryNodes(cat.id);
                    return nodes.map((node) => (
                      <div
                        key={node.type}
                        className="app-sidebar__blocks-mini-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, node.type)}
                        title={node.label}
                        style={{ background: node.color + '14' }}
                      >
                        <span>{node.icon}</span>
                      </div>
                    ));
                  })}
                </div>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Footer */}
        <div className="app-sidebar__footer">
          <button className="app-sidebar__theme-btn" onClick={toggleDarkMode} title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {!collapsed && (
            <div className="app-sidebar__user">
              <div className="app-sidebar__avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
              <div className="app-sidebar__user-info">
                <span className="app-sidebar__user-name">Demo User</span>
                <span className="app-sidebar__user-role">Admin</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="app-sidebar__avatar app-sidebar__avatar--center" title="Demo User">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
          )}
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
