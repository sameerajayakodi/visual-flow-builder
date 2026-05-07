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
            hint: 'Use {{variable}} to insert dynamic values',
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
              {
                key: 'type', label: 'Type', type: 'select',
                options: [
                  { label: 'Reply', value: 'reply' },
                  { label: 'URL', value: 'url' },
                  { label: 'Action', value: 'action' },
                ],
              },
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
              {
                key: 'type', label: 'Type', type: 'select',
                options: [
                  { label: 'Reply', value: 'reply' },
                  { label: 'URL', value: 'url' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // ─── COLLECT INPUT ───
  {
    nodeType: 'inputRequest',
    requiredFields: ['prompt', 'variableName'],
    sections: [
      {
        title: 'Input Settings',
        icon: '📝',
        fields: [
          { key: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Ask the user for input...', rows: 2, required: true },
          { key: 'variableName', label: 'Save to Variable', type: 'text', placeholder: 'user_name', required: true },
          {
            key: 'inputType', label: 'Input Type', type: 'select',
            options: [
              { label: 'Text', value: 'text' },
              { label: 'Number', value: 'number' },
              { label: 'Email', value: 'email' },
              { label: 'Phone', value: 'phone' },
              { label: 'Date', value: 'date' },
            ],
          },
        ],
      },
    ],
  },

  // ─── QUESTIONNAIRE / SURVEY PROMPT ───
  {
    nodeType: 'questionnaire',
    requiredFields: ['promptKey', 'text'],
    sections: [
      {
        title: 'Prompt Details',
        icon: '📋',
        fields: [
          { key: 'pIndex', label: 'Prompt Index (pIndex)', type: 'number', required: true, hint: 'Unique numeric ID. Use 99 for ending prompts.' },
          { key: 'promptKey', label: 'Key', type: 'text', placeholder: 'select_language', required: true },
          {
            key: 'language', label: 'Language', type: 'select',
            options: [
              { label: 'ENGLISH', value: 'ENGLISH' },
              { label: 'TAMIL', value: 'TAMIL' },
              { label: 'SINHALA', value: 'SINHALA' },
              { label: 'HINDI', value: 'HINDI' },
            ],
          },
          { key: 'text', label: 'Question Text', type: 'textarea', placeholder: 'Ask your question here...', rows: 3, required: true },
          {
            key: 'promptProps', label: 'Prompt Type', type: 'select',
            options: [
              { label: 'Text Input', value: 'TEXT', description: 'Free text response' },
              { label: 'Single Choice', value: 'SINGLE_CHOICE', description: 'Pick one answer' },
              { label: 'Multi Choice', value: 'MULTI_CHOICE', description: 'Pick multiple answers' },
              { label: 'Skippable', value: 'SKIPPABLE', description: 'User can skip' },
              { label: 'Ending', value: 'ENDING', description: 'Final prompt (no outputs)' },
            ],
          },
        ],
      },
      {
        title: 'Answers',
        icon: '🔘',
        fields: [
          {
            key: 'answers', label: 'Answer Options', type: 'answer-list', addLabel: '+ Add Answer',
            hint: 'Each answer becomes an output handle you can connect to the next prompt.',
            itemSchema: [
              { key: 'text', label: 'Answer Text', type: 'text', placeholder: 'e.g. Support', required: true },
              {
                key: 'props', label: 'Display Type', type: 'select',
                options: [
                  { label: 'Button', value: 'BUTTON' },
                  { label: 'Radio', value: 'RADIO' },
                  { label: 'Option (Dropdown)', value: 'OPTION' },
                ],
              },
            ],
          },
        ],
      },
    ],
    tips: [
      { icon: '💡', text: 'This produces the senior engineer JSON format. Set pIndex=99 and type=ENDING for the final "Thank You" prompt.' },
    ],
  },

  // ─── CONDITION (for advanced users) ───
  {
    nodeType: 'condition',
    requiredFields: ['rules'],
    sections: [
      {
        title: 'Condition Rules',
        icon: '🔀',
        fields: [
          {
            key: 'combinator', label: 'Combine Rules', type: 'select',
            options: [
              { label: 'All rules match (AND)', value: 'and' },
              { label: 'Any rule matches (OR)', value: 'or' },
            ],
          },
          {
            key: 'rules', label: 'Rules', type: 'rule-list', addLabel: '+ Add Rule',
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
    ],
    tips: [{ icon: '💡', text: 'For simple routing, use Button Choice instead — no condition needed!' }],
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
