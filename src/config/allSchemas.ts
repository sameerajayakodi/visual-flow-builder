// ─── All Node Config Schemas ───
// Each schema declaratively defines the config UI for a node type.
// The ConfigRenderer auto-generates forms from these schemas.

import { registerNodeSchema, type NodeConfigSchema } from './nodeConfigSchema';

const schemas: NodeConfigSchema[] = [
  // ─── TRIGGER ───
  {
    nodeType: 'trigger',
    sections: [
      {
        title: 'Trigger Settings',
        icon: '⚡',
        fields: [
          {
            key: 'triggerType', label: 'Trigger Type', type: 'select',
            options: [
              { label: 'Manual', value: 'manual', icon: '👆' },
              { label: 'Keyword', value: 'keyword', icon: '🔤' },
              { label: 'Schedule', value: 'schedule', icon: '📅' },
              { label: 'API', value: 'api', icon: '🔌' },
              { label: 'Webhook', value: 'webhook', icon: '🪝' },
            ],
          },
          {
            key: 'config.keyword', label: 'Keyword', type: 'text',
            placeholder: 'e.g. hello, start, help',
            showWhen: { field: 'triggerType', equals: 'keyword' },
          },
          {
            key: 'config.schedule', label: 'Schedule', type: 'text',
            placeholder: 'e.g. every 5 minutes',
            showWhen: { field: 'triggerType', equals: 'schedule' },
          },
          {
            key: 'config.endpoint', label: 'Endpoint', type: 'text',
            placeholder: 'https://...',
            showWhen: { field: 'triggerType', equals: ['api', 'webhook'] },
          },
        ],
      },
    ],
    tips: [{ icon: '💡', text: 'This is the entry point of your flow. Every flow needs exactly one trigger.' }],
  },

  // ─── TEXT MESSAGE ───
  {
    nodeType: 'text',
    requiredFields: ['message'],
    sections: [
      {
        title: 'Message',
        icon: '💬',
        fields: [
          {
            key: 'message', label: 'Message', type: 'textarea',
            placeholder: 'Type your message here...', rows: 4, required: true,
            hint: 'insert message content here',
          },
        ],
      },
    ],
  },

  // ─── BUTTON CHOICE ───
  {
    nodeType: 'button',
    requiredFields: ['message', 'buttons'],
    sections: [
      {
        title: 'Button Options',
        icon: '🔘',
        fields: [
          {
            key: 'message', label: 'Question / Message', type: 'textarea',
            placeholder: 'Please choose an option:', rows: 2, required: true,
          },
          {
            key: 'buttons', label: 'Buttons', type: 'button-list',
            addLabel: '+ Add Button', maxItems: 10,
            itemSchema: [
              { key: 'label', label: 'Label', type: 'text', placeholder: 'Button label', required: true },
            ],
          },
        ],
      },
    ],
    tips: [{ icon: '💡', text: 'Each button creates a separate output. Connect each one to the next step — no condition node needed!' }],
  },

  // ─── CARD ───
  {
    nodeType: 'card',
    requiredFields: ['title'],
    sections: [
      {
        title: 'Card Content',
        icon: '🃏',
        fields: [
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Card title', required: true },
          { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Optional subtitle' },
          { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Card content', rows: 3 },
          { key: 'imageUrl', label: 'Image URL', type: 'text', placeholder: 'https://...' },
        ],
      },
      {
        title: 'Card Buttons',
        icon: '🔘',
        fields: [
          {
            key: 'buttons', label: 'Buttons', type: 'button-list',
            addLabel: '+ Add Button', maxItems: 5,
            itemSchema: [
              { key: 'label', label: 'Label', type: 'text', placeholder: 'Button label' },
            ],
          },
        ],
      },
    ],
  },

  // ─── PROMPT (unified — replaces both Collect Input and Survey Prompt) ───
  {
    nodeType: 'questionnaire',
    requiredFields: ['text'],
    sections: [
      {
        title: 'Prompt Details',
        icon: '📋',
        fields: [
          { key: 'text', label: 'Question Text', type: 'textarea', placeholder: 'Ask your question here...', rows: 3, required: true },
          {
            key: 'promptProps', label: 'Prompt Type', type: 'select',
            options: [
              { label: 'Text Input', value: 'TEXT', description: 'User types free text' },
              { label: 'Single Choice', value: 'SINGLE_CHOICE', description: 'Pick one answer' },
              { label: 'Multi Choice', value: 'MULTI_CHOICE', description: 'Pick multiple answers' },
              { label: 'Skippable', value: 'SKIPPABLE', description: 'User can skip' },
              { label: 'Ending', value: 'ENDING', description: 'Final prompt (no outputs)' },
            ],
          },
          {
            key: 'language', label: 'Language', type: 'select',
            options: [
              { label: 'ENGLISH', value: 'ENGLISH' },
              { label: 'TAMIL', value: 'TAMIL' },
              { label: 'SINHALA', value: 'SINHALA' },
              { label: 'HINDI', value: 'HINDI' },
            ],
          },
          { key: 'promptKey', label: 'Prompt Key', type: 'text', placeholder: 'e.g. select_language', hint: 'Optional identifier for the backend.' },
        ],
      },
      {
        title: 'Text Input Settings',
        icon: '📝',
        fields: [
          {
            key: 'inputType', label: 'Input Validation', type: 'select',
            showWhen: { field: 'promptProps', equals: 'TEXT' },
            options: [
              { label: 'Any Text', value: 'text' },
              { label: 'Number', value: 'number' },
              { label: 'Email', value: 'email' },
              { label: 'Phone', value: 'phone' },
              { label: 'Date', value: 'date' },
            ],
          },
          {
            key: 'variableName', label: 'Save to Variable', type: 'text',
            placeholder: 'e.g. user_name, user_email',
            hint: 'Store the user\'s response in this variable.',
            showWhen: { field: 'promptProps', equals: ['TEXT', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'SKIPPABLE'] },
          },
        ],
      },
      {
        title: 'Answer Options',
        icon: '🔘',
        fields: [
          {
            key: 'inputFormat', label: 'Display Format', type: 'select',
            showWhen: { field: 'promptProps', equals: ['SINGLE_CHOICE', 'MULTI_CHOICE', 'SKIPPABLE'] },
            options: [
              { label: 'Buttons', value: 'button' },
              { label: 'List Options', value: 'list' },
              { label: 'Checkboxes', value: 'checkbox' },
              { label: 'Radio Buttons', value: 'radio' },
              { label: 'Dropdown', value: 'dropdown' },
            ],
          },
          {
            key: 'answers', label: 'Answers', type: 'answer-list', addLabel: '+ Add Answer',
            hint: 'Each answer becomes an output handle you can connect to the next step.',
            showWhen: { field: 'promptProps', equals: ['SINGLE_CHOICE', 'MULTI_CHOICE', 'SKIPPABLE'] },
            itemSchema: [
              { key: 'text', label: 'Display Text', type: 'text', placeholder: 'e.g. English, Sinhala', required: true },
              { key: 'value', label: 'Backend Value', type: 'text', placeholder: 'Optional internal value', hint: 'If empty, display text is saved' },
            ],
          },
        ],
      },
    ],
  },

  // ─── CONDITION / SWITCH (unified) ───
  {
    nodeType: 'condition',
    sections: [
      {
        title: 'Branching Type',
        icon: '🔀',
        fields: [
          {
            key: 'conditionType', label: 'Evaluation Mode', type: 'select',
            options: [
              { label: 'Rule-based (Yes/No)', value: 'rules', description: 'Evaluate rules to a Yes/No outcome' },
              { label: 'Switch Cases', value: 'switch', description: 'Check a variable against multiple values' },
            ],
          },
        ],
      },
      {
        title: 'Condition Rules',
        icon: '📋',
        fields: [
          {
            key: 'combinator', label: 'Combine Rules', type: 'select',
            showWhen: { field: 'conditionType', equals: 'rules' },
            options: [
              { label: 'All rules match (AND)', value: 'and' },
              { label: 'Any rule matches (OR)', value: 'or' },
            ],
          },
          {
            key: 'rules', label: 'Rules', type: 'rule-list', addLabel: '+ Add Rule',
            showWhen: { field: 'conditionType', equals: 'rules' },
            itemSchema: [
              { key: 'field', label: 'Field', type: 'text', placeholder: 'variable_name' },
              {
                key: 'operator', label: 'Operator', type: 'select',
                options: [
                  { label: 'Equals', value: 'equals' },
                  { label: 'Not Equals', value: 'notEquals' },
                  { label: 'Contains', value: 'contains' },
                  { label: 'Greater Than', value: 'greaterThan' },
                  { label: 'Less Than', value: 'lessThan' },
                  { label: 'Exists', value: 'exists' },
                ],
              },
              { key: 'value', label: 'Value', type: 'text', placeholder: 'Compare value' },
            ],
          },
        ],
      },
      {
        title: 'Switch Configuration',
        icon: '🔀',
        fields: [
          {
            key: 'variable', label: 'Variable to Check', type: 'text',
            placeholder: 'e.g. user_type',
            showWhen: { field: 'conditionType', equals: 'switch' },
          },
          {
            key: 'cases', label: 'Cases', type: 'case-list', addLabel: '+ Add Case',
            showWhen: { field: 'conditionType', equals: 'switch' },
            itemSchema: [
              { key: 'label', label: 'Label', type: 'text', placeholder: 'Path Label' },
              { key: 'value', label: 'Value', type: 'text', placeholder: 'Match Value' },
            ],
          },
        ],
      },
    ],
    tips: [{ icon: '💡', text: 'You can now use a single Condition node to build complex rule checks or multi-branch switch statements!' }],
  },

  // ─── DELAY ───
  {
    nodeType: 'delay',
    sections: [
      {
        title: 'Timer',
        icon: '⏱️',
        fields: [
          { key: 'duration', label: 'Duration', type: 'number', min: 1 },
          {
            key: 'unit', label: 'Unit', type: 'select',
            options: [
              { label: 'Seconds', value: 'seconds' },
              { label: 'Minutes', value: 'minutes' },
              { label: 'Hours', value: 'hours' },
            ],
          },
        ],
      },
    ],
  },

  // ─── API CALL ───
  {
    nodeType: 'httpRequest',
    requiredFields: ['url'],
    sections: [
      {
        title: 'HTTP Request',
        icon: '🌐',
        fields: [
          {
            key: 'method', label: 'Method', type: 'select',
            options: [
              { label: 'GET', value: 'GET' },
              { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' },
              { label: 'DELETE', value: 'DELETE' },
            ],
          },
          { key: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/endpoint', required: true },
          { key: 'body', label: 'Body', type: 'textarea', placeholder: '{"key": "value"}', rows: 4 },
          { key: 'responseVariable', label: 'Save Response To', type: 'text', placeholder: 'api_response' },
        ],
      },
    ],
  },

  // ─── SEND EMAIL ───
  {
    nodeType: 'sendEmail',
    requiredFields: ['to', 'subject'],
    sections: [
      {
        title: 'Email',
        icon: '📧',
        fields: [
          { key: 'to', label: 'To', type: 'text', placeholder: 'email@example.com', required: true },
          { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject', required: true },
          { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Email content...', rows: 4 },
          { key: 'isHtml', label: 'HTML Email', type: 'checkbox' },
        ],
      },
    ],
  },

  // ─── NOTIFICATION ───
  {
    nodeType: 'notification',
    requiredFields: ['title', 'message'],
    sections: [
      {
        title: 'Notification',
        icon: '🔔',
        fields: [
          {
            key: 'channel', label: 'Channel', type: 'select',
            options: [
              { label: 'Push', value: 'push' },
              { label: 'SMS', value: 'sms' },
              { label: 'In-App', value: 'inApp' },
            ],
          },
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Notification title', required: true },
          { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Notification body', rows: 3, required: true },
          { key: 'target', label: 'Target', type: 'text', placeholder: 'User or group' },
        ],
      },
    ],
  },

  // ─── END ───
  {
    nodeType: 'end',
    sections: [
      {
        title: 'End Settings',
        icon: '🏁',
        fields: [
          {
            key: 'endType', label: 'End Action', type: 'select',
            options: [
              { label: 'Complete', value: 'complete', description: 'End the flow normally' },
              { label: 'Redirect', value: 'redirect', description: 'Redirect to another flow' },
              { label: 'Restart', value: 'restart', description: 'Restart this flow' },
            ],
          },
        ],
      },
    ],
  },

  // ─── NOTES ───
  {
    nodeType: 'notes',
    sections: [
      {
        title: 'Note',
        icon: '📌',
        fields: [
          { key: 'content', label: 'Note Content', type: 'textarea', placeholder: 'Write your note here...', rows: 6 },
          {
            key: 'color', label: 'Color', type: 'color-picker',
            options: [
              { label: 'Yellow', value: '#fef3c7' }, { label: 'Blue', value: '#dbeafe' },
              { label: 'Green', value: '#dcfce7' }, { label: 'Pink', value: '#fce7f3' },
              { label: 'Purple', value: '#f3e8ff' }, { label: 'Indigo', value: '#e0e7ff' },
            ],
          },
        ],
      },
    ],
  },
];

// ─── Register all schemas at import time ───
export function initializeSchemas(): void {
  schemas.forEach(registerNodeSchema);
}

// Auto-initialize on import
initializeSchemas();
