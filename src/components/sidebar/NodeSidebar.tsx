import React, { useState, useMemo } from 'react';
import { NODE_CATEGORIES, getCategoryNodes } from '../../constants';
import type { NodeCategory, NodeLibraryItem } from '../../types';
import { useFlowStore } from '../../store';

const NodeSidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<NodeCategory | null>('trigger');
  const sidebarCollapsed = useFlowStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useFlowStore((s) => s.toggleSidebar);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: NodeLibraryItem[] = [];
    NODE_CATEGORIES.forEach((cat) => {
      getCategoryNodes(cat.id).forEach((node) => {
        if (
          node.label.toLowerCase().includes(q) ||
          node.description.toLowerCase().includes(q)
        ) {
          results.push(node);
        }
      });
    });
    return results;
  }, [searchQuery]);

  const handleDragStart = (
    e: React.DragEvent,
    nodeType: string
  ) => {
    e.dataTransfer.setData('application/flowcraft-node', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  if (sidebarCollapsed) {
    return (
      <div className="sidebar sidebar--collapsed">
        <button
          className="sidebar__toggle-btn"
          onClick={toggleSidebar}
          title="Expand sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="sidebar__mini-icons">
          {NODE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="sidebar__mini-icon"
              title={cat.label}
              onClick={toggleSidebar}
            >
              {cat.icon}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <h2 className="sidebar__title">
          <span className="sidebar__title-icon">🧩</span>
          Blocks
        </h2>
        <button
          className="sidebar__toggle-btn"
          onClick={toggleSidebar}
          title="Collapse sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="sidebar__search">
        <svg className="sidebar__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search blocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sidebar__search-input"
        />
        {searchQuery && (
          <button
            className="sidebar__search-clear"
            onClick={() => setSearchQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Node list */}
      <div className="sidebar__content">
        {filteredCategories ? (
          // Search results
          <div className="sidebar__search-results">
            {filteredCategories.length === 0 ? (
              <div className="sidebar__empty">
                <span className="sidebar__empty-icon">🔍</span>
                <p>No blocks found</p>
                <p className="sidebar__empty-hint">Try a different search term</p>
              </div>
            ) : (
              filteredCategories.map((node) => (
                <NodeCard key={node.type} node={node} onDragStart={handleDragStart} />
              ))
            )}
          </div>
        ) : (
          // Category view
          NODE_CATEGORIES.map((category) => {
            const nodes = getCategoryNodes(category.id);
            const isExpanded = expandedCategory === category.id;

            return (
              <div key={category.id} className="sidebar__category">
                <button
                  className={`sidebar__category-header ${isExpanded ? 'sidebar__category-header--active' : ''}`}
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : category.id)
                  }
                >
                  <span className="sidebar__category-icon">{category.icon}</span>
                  <span className="sidebar__category-label">{category.label}</span>
                  <span className="sidebar__category-count">{nodes.length}</span>
                  <svg
                    className={`sidebar__category-arrow ${isExpanded ? 'sidebar__category-arrow--open' : ''}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {isExpanded && (
                  <div className="sidebar__category-nodes">
                    {nodes.map((node) => (
                      <NodeCard
                        key={node.type}
                        node={node}
                        onDragStart={handleDragStart}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── Draggable Node Card ───
const NodeCard: React.FC<{
  node: NodeLibraryItem;
  onDragStart: (e: React.DragEvent, type: string) => void;
}> = ({ node, onDragStart }) => {
  return (
    <div
      className="node-card"
      draggable
      onDragStart={(e) => onDragStart(e, node.type)}
      title={node.description}
    >
      <div
        className="node-card__icon"
        style={{ background: node.color + '18', color: node.color }}
      >
        {node.icon}
      </div>
      <div className="node-card__info">
        <span className="node-card__label">{node.label}</span>
        <span className="node-card__description">{node.description}</span>
      </div>
      <div className="node-card__drag-hint">
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
          <circle cx="2" cy="2" r="1" fill="currentColor"/>
          <circle cx="6" cy="2" r="1" fill="currentColor"/>
          <circle cx="2" cy="7" r="1" fill="currentColor"/>
          <circle cx="6" cy="7" r="1" fill="currentColor"/>
          <circle cx="2" cy="12" r="1" fill="currentColor"/>
          <circle cx="6" cy="12" r="1" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
};

export default NodeSidebar;
