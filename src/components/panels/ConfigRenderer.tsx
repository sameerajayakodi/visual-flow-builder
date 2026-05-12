// ─── ConfigRenderer ───
// Auto-generates config forms from NodeConfigSchema.
// Replaces 23 hand-coded config components with ONE data-driven renderer.

import React, { useCallback } from 'react';
import type { ConfigField, ConfigSection, NodeConfigSchema } from '../../config';

interface ConfigRendererProps {
  schema: NodeConfigSchema;
  data: Record<string, any>;
  onUpdate: (field: string, value: any) => void;
  availableVariables?: string[];
}

// ─── Resolve nested values like "config.keyword" ───
function getNestedValue(data: Record<string, any>, key: string): any {
  const parts = key.split('.');
  let current: any = data;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

function setNestedValue(data: Record<string, any>, key: string, value: any, onUpdate: (f: string, v: any) => void): void {
  const parts = key.split('.');
  if (parts.length === 1) {
    onUpdate(key, value);
  } else {
    // For nested keys like "config.keyword", update the parent object
    const rootKey = parts[0];
    const rootObj = { ...(data[rootKey] || {}) };
    let current: any = rootObj;
    for (let i = 1; i < parts.length - 1; i++) {
      current[parts[i]] = { ...(current[parts[i]] || {}) };
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    onUpdate(rootKey, rootObj);
  }
}

// ─── Check showWhen conditions ───
function isFieldVisible(field: ConfigField, data: Record<string, any>): boolean {
  if (!field.showWhen) return true;
  const currentValue = getNestedValue(data, field.showWhen.field);
  const { equals } = field.showWhen;

  const isCurrentArray = Array.isArray(currentValue);

  if (Array.isArray(equals)) {
    if (isCurrentArray) {
      return currentValue.some(val => equals.includes(val));
    }
    return equals.includes(currentValue);
  }

  if (isCurrentArray) {
    return currentValue.includes(equals);
  }
  return currentValue === equals;
}

// ─── Rich Text Input (with Variable Chips) ───
const RichTextInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  availableVariables: string[];
  placeholder?: string;
  multiline?: boolean;
}> = ({ value, onChange, availableVariables, placeholder, multiline }) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [showVarPicker, setShowVarPicker] = React.useState(false);
  const lastEmittedValue = React.useRef(value);
  
  const formatValueToHtml = (text: string) => {
    if (!text) return '';
    let escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let html = escaped.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      return `<span contenteditable="false" class="var-chip" style="display:inline-block; background:rgba(16, 185, 129, 0.15); color:#10b981; border:1px solid rgba(16, 185, 129, 0.3); border-radius:4px; padding:1px 5px; font-size:10px; font-weight:700; margin:0 2px; user-select:none; vertical-align:middle; cursor:default;">${varName}</span>`;
    });
    if (multiline) {
      html = html.replace(/\n/g, '<br>');
    }
    return html;
  };

  const parseHtmlToValue = (element: HTMLElement) => {
    let result = '';
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        result += (node.textContent || '').replace(/\u00A0/g, ' ');
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.classList.contains('var-chip')) {
          result += `{{${el.textContent}}}`;
        } else if (el.tagName === 'BR') {
          result += '\n';
        } else if (el.tagName === 'DIV' || el.tagName === 'P') {
          result += (result.length > 0 && !result.endsWith('\n') ? '\n' : '') + parseHtmlToValue(el);
        } else {
          result += parseHtmlToValue(el);
        }
      }
    }
    return result;
  };

  React.useEffect(() => {
    if (value !== lastEmittedValue.current && editorRef.current) {
      const currentHtmlValue = parseHtmlToValue(editorRef.current);
      if (value !== currentHtmlValue) {
        editorRef.current.innerHTML = formatValueToHtml(value);
        lastEmittedValue.current = value;
      }
    }
  }, [value, multiline]);

  React.useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = formatValueToHtml(value);
    }
  }, []);

  const handleInput = () => {
    if (!editorRef.current) return;
    const newVal = parseHtmlToValue(editorRef.current);
    lastEmittedValue.current = newVal;
    onChange(newVal);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const insertVariable = (varName: string) => {
    setShowVarPicker(false);
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        const chip = document.createElement('span');
        chip.contentEditable = 'false';
        chip.className = 'var-chip';
        chip.style.cssText = 'display:inline-block; background:rgba(16, 185, 129, 0.15); color:#10b981; border:1px solid rgba(16, 185, 129, 0.3); border-radius:4px; padding:1px 5px; font-size:10px; font-weight:700; margin:0 2px; user-select:none; vertical-align:middle; cursor:default;';
        chip.textContent = varName;
        
        range.insertNode(chip);
        
        range.setStartAfter(chip);
        range.setEndAfter(chip);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        editorRef.current.innerHTML += formatValueToHtml(`{{${varName}}}`);
        // move cursor to end
        const newSel = window.getSelection();
        const newRange = document.createRange();
        newRange.selectNodeContents(editorRef.current);
        newRange.collapse(false);
        newSel?.removeAllRanges();
        newSel?.addRange(newRange);
      }
    } else {
       editorRef.current.innerHTML += formatValueToHtml(`{{${varName}}}`);
    }
    
    handleInput();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className={multiline ? "config-field__textarea" : "config-field__input"}
        style={{
           minHeight: multiline ? '80px' : '34px',
           height: multiline ? 'auto' : '34px',
           overflowY: 'auto',
           display: 'block',
           whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
           overflowX: multiline ? 'hidden' : 'auto',
           paddingBottom: '24px',
           outline: 'none'
        }}
      />
      {!value && placeholder && (
        <span style={{ position: 'absolute', top: '9px', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '13px' }}>
          {placeholder}
        </span>
      )}
      {availableVariables.length > 0 && (
        <button
          type="button"
          onClick={() => setShowVarPicker(!showVarPicker)}
          title="Insert Variable"
          style={{ position: 'absolute', right: 4, bottom: 4, fontSize: '10px', padding: '2px 4px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)', zIndex: 10 }}
        >
          {'{ }'}
        </button>
      )}
      {showVarPicker && (
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', minWidth: '120px', maxHeight: '150px', overflowY: 'auto', marginTop: '2px' }}>
          {availableVariables.map(v => (
            <button
              key={v}
              type="button"
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '4px 8px', fontSize: '11px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              onClick={(e) => {
                e.preventDefault();
                insertVariable(v);
              }}
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Field Renderers ───
const FieldWidget: React.FC<{
  field: ConfigField;
  value: any;
  onChange: (value: any) => void;
  data: Record<string, any>;
  onUpdate: (field: string, value: any) => void;
  availableVariables: string[];
}> = ({ field, value, onChange, data, onUpdate, availableVariables }) => {
  switch (field.type) {
    case 'text':
      return (
        <RichTextInput
          value={value ?? ''}
          onChange={onChange}
          availableVariables={availableVariables}
          placeholder={field.placeholder}
          multiline={false}
        />
      );

    case 'textarea':
      return (
        <RichTextInput
          value={value ?? ''}
          onChange={onChange}
          availableVariables={availableVariables}
          placeholder={field.placeholder}
          multiline={true}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          className="config-field__input config-field__input--number"
          value={value ?? ''}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder}
        />
      );

    case 'select': {
      const isArrayValue = Array.isArray(value);
      const currentSelectValue = isArrayValue ? (value[0] ?? '') : (value ?? '');

      return (
        <div className="config-field__select-wrap">
          {field.options && field.options.length <= 4 && field.options.every(o => o.icon) ? (
            // Visual button-group for small option sets with icons
            <div className="config-field__option-cards">
              {field.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`config-field__option-card ${currentSelectValue === opt.value ? 'config-field__option-card--active' : ''}`}
                  onClick={() => onChange(isArrayValue ? [opt.value] : opt.value)}
                >
                  <span className="config-field__option-icon">{opt.icon}</span>
                  <span className="config-field__option-label">{opt.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <select
              className="config-field__select"
              value={currentSelectValue || field.defaultValue || ''}
              onChange={(e) => onChange(isArrayValue ? [e.target.value] : e.target.value)}
            >
              {(field.options ?? []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon ? `${opt.icon} ` : ''}{opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      );
    }

    case 'checkbox':
      return (
        <label className="config-checkbox">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      );

    case 'slider':
      return (
        <div className="config-field__slider-wrap">
          <input
            type="range"
            className="config-field__range"
            value={value ?? field.defaultValue ?? 0.5}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            min={field.min ?? 0}
            max={field.max ?? 1}
            step={field.step ?? 0.1}
          />
          <div className="config-field__range-labels">
            <span>{field.minLabel || field.min}</span>
            <span className="config-field__range-value">{value ?? field.defaultValue ?? 0.5}</span>
            <span>{field.maxLabel || field.max}</span>
          </div>
        </div>
      );

    case 'color-picker':
      return (
        <div className="config-color-grid">
          {(field.options ?? []).map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`config-color-swatch ${value === opt.value ? 'config-color-swatch--active' : ''}`}
              style={{ background: opt.value }}
              onClick={() => onChange(opt.value)}
              title={opt.label}
            />
          ))}
        </div>
      );

    case 'duration':
      return (
        <div className="config-field__row">
          <input
            type="number"
            className="config-field__input config-field__input--number"
            value={getNestedValue(data, 'duration') ?? 5}
            onChange={(e) => onUpdate('duration', parseInt(e.target.value) || 0)}
            min={0}
          />
          <select
            className="config-field__select"
            value={getNestedValue(data, 'unit') ?? 'seconds'}
            onChange={(e) => onUpdate('unit', e.target.value)}
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      );

    case 'button-list':
    case 'case-list':
    case 'branch-list':
    case 'field-list':
    case 'card-list':
    case 'rule-list':
    case 'answer-list':
      return (
        <ListWidget
          items={value ?? []}
          onChange={onChange}
          itemSchema={field.itemSchema ?? []}
          addLabel={field.addLabel ?? '+ Add Item'}
          maxItems={field.maxItems}
          listType={field.type}
          availableVariables={availableVariables}
        />
      );

    default:
      return (
        <input
          type="text"
          className="config-field__input"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
  }
};

// ─── List Widget (handles button-list, rule-list, case-list, etc.) ───
const ListWidget: React.FC<{
  items: any[];
  onChange: (items: any[]) => void;
  itemSchema: ConfigField[];
  addLabel: string;
  maxItems?: number;
  listType: string;
  availableVariables: string[];
}> = ({ items, onChange, itemSchema, addLabel, maxItems, listType, availableVariables }) => {
  const addItem = () => {
    if (maxItems && items.length >= maxItems) return;
    const newItem: Record<string, any> = { id: `item_${Date.now()}` };
    itemSchema.forEach((f) => {
      newItem[f.key] = f.defaultValue ?? (f.type === 'checkbox' ? false : '');
    });
    // Smart defaults based on list type
    if (listType === 'button-list') {
      newItem.label = `Option ${items.length + 1}`;
    } else if (listType === 'case-list') {
      newItem.label = `Case ${items.length + 1}`;
      newItem.value = `value_${items.length + 1}`;
    } else if (listType === 'branch-list') {
      newItem.label = `Path ${items.length + 1}`;
      newItem.percentage = 50;
    } else if (listType === 'field-list') {
      newItem.label = 'Field';
      newItem.name = `field_${items.length + 1}`;
      newItem.type = 'text';
      newItem.required = false;
    } else if (listType === 'rule-list') {
      newItem.field = '';
      newItem.operator = 'equals';
      newItem.value = '';
    } else if (listType === 'card-list') {
      newItem.title = `Card ${items.length + 1}`;
      newItem.subtitle = '';
      newItem.body = '';
      newItem.imageUrl = '';
    } else if (listType === 'answer-list') {
      const maxIndex = items.reduce((max: number, i: any) => Math.max(max, Number(i.aIndex) || 0), 0);
      newItem.aIndex = maxIndex + 1;
      newItem.text = `Option ${items.length + 1}`;
    }
    onChange([...items, newItem]);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, key: string, value: any) => {
    onChange(items.map((item, i) => {
      if (i === idx) {
        const updatedItem = { ...item, [key]: value };
        
        // Auto-fill 'value' when typing 'text' in answer-list
        if (listType === 'answer-list' && key === 'text') {
          const oldTextKey = (item.text || '').toLowerCase().replace(/[\s\W]+/g, '_').replace(/^_|_$/g, '');
          const currentVal = item.value || '';
          
          // If the current value is empty, OR if it matches the auto-generated key of the old text
          if (!currentVal || currentVal === oldTextKey) {
            updatedItem.value = (value || '').toLowerCase().replace(/[\s\W]+/g, '_').replace(/^_|_$/g, '');
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const isCardStyle = listType === 'card-list' || listType === 'field-list';

  return (
    <div className={isCardStyle ? 'config-card-list' : 'config-rules'}>
      {!isCardStyle && items.length > 0 && (
        <div className="config-rule-headers">
          {itemSchema.map((f) => (
            <span key={f.key} className="config-rule-header">
              {f.label}
            </span>
          ))}
        </div>
      )}
      {items.map((item: any, idx: number) => (
        <div key={item.id || idx} className={isCardStyle ? 'config-card-item' : 'config-rule-item'}>
          {isCardStyle && (
            <div className="config-card-item__header">
              <span className="config-card-item__title">
                {listType === 'card-list' ? `Card ${idx + 1}` : `Field ${idx + 1}`}
              </span>
              <button
                type="button"
                className="config-card-item__remove"
                onClick={() => removeItem(idx)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          )}

          {isCardStyle ? (
            // Card-style: each field on its own line
            <>
              {itemSchema.map((fieldDef) => (
                <div key={fieldDef.key} className="config-field">
                  <label className="config-field__label">{fieldDef.label}</label>
                  <FieldWidget
                    field={fieldDef}
                    value={item[fieldDef.key]}
                    onChange={(v) => updateItem(idx, fieldDef.key, v)}
                    data={item}
                    onUpdate={(k, v) => updateItem(idx, k, v)}
                    availableVariables={availableVariables}
                  />
                </div>
              ))}
            </>
          ) : (
            // Inline-style: all fields in a row
            <>
              {itemSchema.map((fieldDef) => (
                <FieldWidget
                  key={fieldDef.key}
                  field={{
                    ...fieldDef,
                    type: fieldDef.type === 'select' ? 'select' : 'text',
                  }}
                  value={item[fieldDef.key]}
                  onChange={(v) => updateItem(idx, fieldDef.key, v)}
                  data={item}
                  onUpdate={(k, v) => updateItem(idx, k, v)}
                  availableVariables={availableVariables}
                />
              ))}
              {listType === 'branch-list' && (
                <span className="config-field__suffix">%</span>
              )}
              <button
                type="button"
                className="config-button-remove"
                onClick={() => removeItem(idx)}
                title="Remove"
              >
                ✕
              </button>
            </>
          )}
        </div>
      ))}
      <button type="button" className="config-button-add" onClick={addItem}>
        {addLabel}
      </button>
    </div>
  );
};

// ─── Section Renderer ───
const SectionRenderer: React.FC<{
  section: ConfigSection;
  data: Record<string, any>;
  onUpdate: (field: string, value: any) => void;
  availableVariables: string[];
}> = ({ section, data, onUpdate, availableVariables }) => {
  const [collapsed, setCollapsed] = React.useState(section.collapsed ?? section.advanced ?? false);

  const visibleFields = section.fields.filter((f) => isFieldVisible(f, data));
  if (visibleFields.length === 0) return null;

  return (
    <div className={`config-section ${collapsed ? 'config-section--collapsed' : ''}`}>
      <button
        type="button"
        className="config-section__header"
        onClick={() => setCollapsed(!collapsed)}
      >
        {section.icon && <span className="config-section__icon">{section.icon}</span>}
        <span className="config-section__title">{section.title}</span>
        {section.advanced && (
          <span className="config-section__badge">Advanced</span>
        )}
        <svg
          className={`config-section__arrow ${collapsed ? '' : 'config-section__arrow--open'}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {!collapsed && (
        <div className="config-section__body">
          {visibleFields.map((field) => {
            // Checkbox renders inline — don't wrap in config-field
            if (field.type === 'checkbox') {
              return (
                <div key={field.key} className="config-field">
                  <FieldWidget
                    field={field}
                    value={getNestedValue(data, field.key)}
                    onChange={(v) => setNestedValue(data, field.key, v, onUpdate)}
                    data={data}
                    onUpdate={onUpdate}
                    availableVariables={availableVariables}
                  />
                </div>
              );
            }

            return (
              <div key={field.key} className="config-field">
                <label className="config-field__label">
                  {field.label}
                  {field.required && <span className="config-field__required">*</span>}
                </label>
                <FieldWidget
                  field={field}
                  value={getNestedValue(data, field.key)}
                  onChange={(v) => setNestedValue(data, field.key, v, onUpdate)}
                  data={data}
                  onUpdate={onUpdate}
                  availableVariables={availableVariables}
                />
                {field.hint && <span className="config-field__hint">{field.hint}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main ConfigRenderer ───
const ConfigRenderer: React.FC<ConfigRendererProps> = ({ schema, data, onUpdate, availableVariables = [] }) => {
  return (
    <div className="config-renderer">
      {schema.sections.map((section, idx) => (
        <SectionRenderer
          key={`${section.title}-${idx}`}
          section={section}
          data={data}
          onUpdate={onUpdate}
          availableVariables={availableVariables}
        />
      ))}

      {schema.tips && schema.tips.length > 0 && (
        <div className="config-renderer__tips">
          {schema.tips.map((tip, idx) => (
            <div key={idx} className="config-panel__tip">
              <span>{tip.icon}</span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConfigRenderer;
