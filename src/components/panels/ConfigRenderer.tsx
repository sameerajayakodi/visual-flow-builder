// ─── ConfigRenderer ───
// Auto-generates config forms from NodeConfigSchema.
// Replaces 23 hand-coded config components with ONE data-driven renderer.

import React, { useCallback } from 'react';
import type { ConfigField, ConfigSection, NodeConfigSchema } from '../../config';

interface ConfigRendererProps {
  schema: NodeConfigSchema;
  data: Record<string, any>;
  onUpdate: (field: string, value: any) => void;
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
  if (Array.isArray(equals)) {
    return equals.includes(currentValue);
  }
  return currentValue === equals;
}

// ─── Field Renderers ───
const FieldWidget: React.FC<{
  field: ConfigField;
  value: any;
  onChange: (value: any) => void;
  data: Record<string, any>;
  onUpdate: (field: string, value: any) => void;
}> = ({ field, value, onChange, data, onUpdate }) => {
  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          className="config-field__input"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );

    case 'textarea':
      return (
        <textarea
          className="config-field__textarea"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows ?? 3}
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

    case 'select':
      return (
        <div className="config-field__select-wrap">
          {field.options && field.options.length <= 4 && field.options.every(o => o.icon) ? (
            // Visual button-group for small option sets with icons
            <div className="config-field__option-cards">
              {field.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`config-field__option-card ${value === opt.value ? 'config-field__option-card--active' : ''}`}
                  onClick={() => onChange(opt.value)}
                >
                  <span className="config-field__option-icon">{opt.icon}</span>
                  <span className="config-field__option-label">{opt.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <select
              className="config-field__select"
              value={value ?? field.defaultValue ?? ''}
              onChange={(e) => onChange(e.target.value)}
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
}> = ({ items, onChange, itemSchema, addLabel, maxItems, listType }) => {
  const addItem = () => {
    if (maxItems && items.length >= maxItems) return;
    const newItem: Record<string, any> = { id: `item_${Date.now()}` };
    itemSchema.forEach((f) => {
      newItem[f.key] = f.defaultValue ?? (f.type === 'checkbox' ? false : '');
    });
    // Smart defaults based on list type
    if (listType === 'button-list') {
      newItem.label = `Option ${items.length + 1}`;
      newItem.value = `option_${items.length + 1}`;
      newItem.type = newItem.type || 'reply';
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
      newItem.aIndex = items.length + 1;
      newItem.keyPattern = `${items.length + 1}`;
      newItem.keyPatternHuman = `${items.length + 1}`;
      newItem.text = `Option ${items.length + 1}`;
      newItem.props = ['BUTTON'];
    }
    onChange([...items, newItem]);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, key: string, value: any) => {
    onChange(items.map((item, i) => (i === idx ? { ...item, [key]: value } : item)));
  };

  const isCardStyle = listType === 'card-list' || listType === 'field-list';

  return (
    <div className={isCardStyle ? 'config-card-list' : 'config-rules'}>
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
}> = ({ section, data, onUpdate }) => {
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
const ConfigRenderer: React.FC<ConfigRendererProps> = ({ schema, data, onUpdate }) => {
  return (
    <div className="config-renderer">
      {schema.sections.map((section, idx) => (
        <SectionRenderer
          key={`${section.title}-${idx}`}
          section={section}
          data={data}
          onUpdate={onUpdate}
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
