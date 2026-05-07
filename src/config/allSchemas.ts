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

  // ─── TEXT ───
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

  // ─── BUTTON ───
  {
    nodeType: 'button',
    requiredFields: ['message', 'buttons'],
    sections: [
      {
        title: 'Button Options',
        icon: '🔘',
        fields: [
          {
            key: 'message', label: 'Message', type: 'textarea',
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
  },

  // ─── MEDIA ───
  {
    nodeType: 'media',
    requiredFields: ['url'],
    sections: [
      {
        title: 'Media',
        icon: '🖼️',
        fields: [
          {
            key: 'mediaType', label: 'Media Type', type: 'select',
            options: [
              { label: 'Image', value: 'image', icon: '🖼️' },
              { label: 'Video', value: 'video', icon: '🎬' },
              { label: 'Audio', value: 'audio', icon: '🎵' },
              { label: 'File', value: 'file', icon: '📄' },
            ],
          },
          { key: 'url', label: 'Media URL', type: 'text', placeholder: 'https://...', required: true },
          { key: 'caption', label: 'Caption', type: 'textarea', placeholder: 'Add a short caption...', rows: 3 },
          {
            key: 'altText', label: 'Alt Text', type: 'text', placeholder: 'Describe the image',
            showWhen: { field: 'mediaType', equals: 'image' },
          },
          {
            key: 'autoplay', label: 'Autoplay', type: 'checkbox',
            showWhen: { field: 'mediaType', equals: ['video', 'audio'] },
          },
          {
            key: 'loop', label: 'Loop', type: 'checkbox',
            showWhen: { field: 'mediaType', equals: ['video', 'audio'] },
          },
        ],
      },
    ],
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
          { key: 'imageUrl', label: 'Image URL', type: 'text', placeholder: 'https://...' },
          { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Describe the card content...', rows: 3 },
          {
            key: 'layout', label: 'Layout', type: 'select',
            options: [{ label: 'Vertical', value: 'vertical' }, { label: 'Horizontal', value: 'horizontal' }],
          },
          {
            key: 'buttons', label: 'Buttons', type: 'button-list', addLabel: '+ Add Button',
            itemSchema: [
              { key: 'label', label: 'Label', type: 'text', placeholder: 'Label' },
              { key: 'value', label: 'Value', type: 'text', placeholder: 'Value' },
              {
                key: 'type', label: 'Type', type: 'select',
                options: [{ label: 'Reply', value: 'reply' }, { label: 'URL', value: 'url' }, { label: 'Action', value: 'action' }],
              },
            ],
          },
        ],
      },
    ],
  },

  // ─── CAROUSEL ───
  {
    nodeType: 'carousel',
    requiredFields: ['cards'],
    sections: [
      {
        title: 'Carousel',
        icon: '🎠',
        fields: [
          {
            key: 'cards', label: 'Cards', type: 'card-list', addLabel: '+ Add Card',
            itemSchema: [
              { key: 'title', label: 'Title', type: 'text', placeholder: 'Card title' },
              { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Subtitle' },
              { key: 'imageUrl', label: 'Image URL', type: 'text', placeholder: 'https://...' },
              { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Card body...', rows: 3 },
            ],
          },
          { key: 'autoplay', label: 'Auto-scroll cards', type: 'checkbox' },
          { key: 'loop', label: 'Loop carousel', type: 'checkbox' },
        ],
      },
    ],
  },

  // ─── FORM ───
  {
    nodeType: 'form',
    requiredFields: ['title', 'fields'],
    sections: [
      {
        title: 'Form Setup',
        icon: '📋',
        fields: [
          { key: 'title', label: 'Form Title', type: 'text', placeholder: 'Form title', required: true },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Explain what you need from the user...', rows: 3 },
          {
            key: 'fields', label: 'Fields', type: 'field-list', addLabel: '+ Add Field',
            itemSchema: [
              { key: 'label', label: 'Label', type: 'text', placeholder: 'Field label' },
              { key: 'name', label: 'Name', type: 'text', placeholder: 'field_name' },
              {
                key: 'type', label: 'Type', type: 'select',
                options: [
                  { label: 'Text', value: 'text' }, { label: 'Email', value: 'email' },
                  { label: 'Number', value: 'number' }, { label: 'Phone', value: 'phone' },
                  { label: 'Date', value: 'date' }, { label: 'Select', value: 'select' },
                  { label: 'Textarea', value: 'textarea' },
                ],
              },
              { key: 'placeholder', label: 'Placeholder', type: 'text', placeholder: 'Placeholder text' },
              { key: 'required', label: 'Required', type: 'checkbox' },
            ],
          },
          { key: 'submitLabel', label: 'Submit Button', type: 'text', placeholder: 'Submit' },
        ],
      },
    ],
  },

  // ─── INPUT REQUEST ───
  {
    nodeType: 'inputRequest',
    requiredFields: ['prompt', 'variableName'],
    sections: [
      {
        title: 'Collect Input',
        icon: '📝',
        fields: [
          { key: 'prompt', label: 'Prompt Message', type: 'textarea', placeholder: 'What would you like to ask?', rows: 3, required: true },
          { key: 'variableName', label: 'Save Response As', type: 'text', placeholder: 'e.g. user_name, email', required: true },
          {
            key: 'inputType', label: 'Input Type', type: 'select',
            options: [
              { label: 'Text', value: 'text' }, { label: 'Number', value: 'number' },
              { label: 'Email', value: 'email' }, { label: 'Phone', value: 'phone' },
              { label: 'Date', value: 'date' }, { label: 'Selection', value: 'select' },
            ],
          },
        ],
      },
    ],
  },

  // ─── CONDITION ───
  {
    nodeType: 'condition',
    requiredFields: ['rules'],
    sections: [
      {
        title: 'Branching Logic',
        icon: '🔀',
        fields: [
          {
            key: 'combinator', label: 'When should this branch?', type: 'select',
            options: [
              { label: 'All conditions match (AND)', value: 'and', icon: '🔗' },
              { label: 'Any condition matches (OR)', value: 'or', icon: '⚡' },
            ],
          },
          {
            key: 'rules', label: 'Conditions', type: 'rule-list', addLabel: '+ Add Condition',
            itemSchema: [
              { key: 'field', label: 'Variable', type: 'text', placeholder: 'Variable' },
              {
                key: 'operator', label: 'Operator', type: 'select',
                options: [
                  { label: 'equals', value: 'equals' }, { label: 'not equals', value: 'notEquals' },
                  { label: 'contains', value: 'contains' }, { label: 'greater than', value: 'greaterThan' },
                  { label: 'less than', value: 'lessThan' }, { label: 'exists', value: 'exists' },
                  { label: 'not exists', value: 'notExists' },
                ],
              },
              { key: 'value', label: 'Value', type: 'text', placeholder: 'Value' },
            ],
          },
        ],
      },
    ],
    tips: [{ icon: '💡', text: 'Connect the Yes (left) and No (right) outputs to different paths.' }],
  },

  // ─── SWITCH ───
  {
    nodeType: 'switch',
    requiredFields: ['variable', 'cases'],
    sections: [
      {
        title: 'Switch Paths',
        icon: '🔃',
        fields: [
          { key: 'variable', label: 'Switch Variable', type: 'text', placeholder: 'status', required: true },
          {
            key: 'cases', label: 'Cases', type: 'case-list', addLabel: '+ Add Case',
            itemSchema: [
              { key: 'label', label: 'Label', type: 'text', placeholder: 'Label' },
              { key: 'value', label: 'Value', type: 'text', placeholder: 'Value' },
            ],
          },
          { key: 'defaultCaseLabel', label: 'Default Label', type: 'text', placeholder: 'Default' },
        ],
      },
    ],
  },

  // ─── DELAY ───
  {
    nodeType: 'delay',
    requiredFields: ['duration'],
    sections: [
      {
        title: 'Wait Duration',
        icon: '⏱️',
        fields: [
          {
            key: 'duration', label: 'Duration', type: 'number', min: 0, required: true,
            placeholder: '5',
          },
          {
            key: 'unit', label: 'Unit', type: 'select',
            options: [
              { label: 'Seconds', value: 'seconds' }, { label: 'Minutes', value: 'minutes' },
              { label: 'Hours', value: 'hours' }, { label: 'Days', value: 'days' },
            ],
          },
        ],
      },
    ],
  },

  // ─── RANDOM SPLIT ───
  {
    nodeType: 'randomSplit',
    requiredFields: ['branches'],
    sections: [
      {
        title: 'A/B Split',
        icon: '🎲',
        fields: [
          {
            key: 'branches', label: 'Branches', type: 'branch-list', addLabel: '+ Add Branch',
            itemSchema: [
              { key: 'label', label: 'Label', type: 'text', placeholder: 'Label' },
              { key: 'percentage', label: 'Percentage', type: 'number', min: 0, max: 100 },
            ],
          },
        ],
      },
    ],
  },

  // ─── LOOP ───
  {
    nodeType: 'loop',
    sections: [
      {
        title: 'Loop Settings',
        icon: '🔁',
        fields: [
          {
            key: 'loopType', label: 'Loop Type', type: 'select',
            options: [
              { label: 'Fixed Count', value: 'count' },
              { label: 'Until Condition', value: 'until' },
            ],
          },
          {
            key: 'iterations', label: 'Iterations', type: 'number', min: 1,
            showWhen: { field: 'loopType', equals: 'count' },
          },
          {
            key: 'condition', label: 'Stop Condition', type: 'text',
            placeholder: "status == 'done'",
            showWhen: { field: 'loopType', equals: 'until' },
          },
          { key: 'maxIterations', label: 'Max Iterations', type: 'number', min: 0, hint: '0 means no limit' },
          { key: 'delaySeconds', label: 'Delay Between Loops (sec)', type: 'number', min: 0 },
        ],
      },
    ],
  },

  // ─── END ───
  {
    nodeType: 'end',
    sections: [
      {
        title: 'End Action',
        icon: '🏁',
        fields: [
          {
            key: 'endType', label: 'End Action', type: 'select',
            options: [
              { label: 'Complete Flow', value: 'complete' },
              { label: 'Redirect to Another Flow', value: 'redirect' },
              { label: 'Restart Flow', value: 'restart' },
            ],
          },
        ],
      },
    ],
  },

  // ─── HTTP REQUEST ───
  {
    nodeType: 'httpRequest',
    requiredFields: ['url'],
    sections: [
      {
        title: 'API Request',
        icon: '🌐',
        fields: [
          {
            key: 'method', label: 'Method', type: 'select',
            options: [
              { label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' }, { label: 'DELETE', value: 'DELETE' },
              { label: 'PATCH', value: 'PATCH' },
            ],
          },
          { key: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/endpoint', required: true },
          { key: 'body', label: 'Request Body', type: 'textarea', placeholder: '{"key": "value"}', rows: 4 },
          { key: 'responseVariable', label: 'Save Response As', type: 'text', placeholder: 'response' },
        ],
      },
    ],
  },

  // ─── AI PROMPT ───
  {
    nodeType: 'aiPrompt',
    requiredFields: ['prompt'],
    sections: [
      {
        title: 'AI Settings',
        icon: '🤖',
        fields: [
          { key: 'prompt', label: 'AI Prompt', type: 'textarea', placeholder: 'Describe what the AI should do...', rows: 5, required: true },
          {
            key: 'model', label: 'Model', type: 'select',
            options: [
              { label: 'GPT-4', value: 'gpt-4' }, { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
              { label: 'Claude 3', value: 'claude-3' }, { label: 'Gemini Pro', value: 'gemini-pro' },
            ],
          },
          {
            key: 'temperature', label: 'Temperature', type: 'slider',
            min: 0, max: 1, step: 0.1, minLabel: 'Precise', maxLabel: 'Creative',
          },
          { key: 'responseVariable', label: 'Save Response As', type: 'text', placeholder: 'ai_response' },
        ],
      },
    ],
  },

  // ─── DATABASE ACTION ───
  {
    nodeType: 'databaseAction',
    requiredFields: ['resource'],
    sections: [
      {
        title: 'Database',
        icon: '🗃️',
        fields: [
          {
            key: 'action', label: 'Action', type: 'select',
            options: [
              { label: 'Query', value: 'query' }, { label: 'Insert', value: 'insert' },
              { label: 'Update', value: 'update' }, { label: 'Delete', value: 'delete' },
            ],
          },
          { key: 'resource', label: 'Table / Collection', type: 'text', placeholder: 'customers', required: true },
          { key: 'filter', label: 'Filter / Query', type: 'textarea', placeholder: "{ status: 'active' }", rows: 3 },
          { key: 'data', label: 'Data Payload', type: 'textarea', placeholder: "{ name: 'Alice' }", rows: 3 },
          { key: 'resultVariable', label: 'Save Result As', type: 'text', placeholder: 'db_result' },
        ],
      },
    ],
  },

  // ─── SAVE VARIABLE ───
  {
    nodeType: 'saveVariable',
    requiredFields: ['variableName'],
    sections: [
      {
        title: 'Save Variable',
        icon: '💾',
        fields: [
          { key: 'variableName', label: 'Variable Name', type: 'text', placeholder: 'e.g. user_score', required: true },
          {
            key: 'valueType', label: 'Value Type', type: 'select',
            options: [
              { label: 'Static Value', value: 'static' },
              { label: 'Expression', value: 'expression' },
              { label: 'From Previous Step', value: 'fromPrevious' },
            ],
          },
          { key: 'value', label: 'Value', type: 'text', placeholder: 'Enter value...' },
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
          { key: 'to', label: 'To', type: 'text', placeholder: 'recipient@example.com', required: true },
          { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject', required: true },
          { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Email content...', rows: 5 },
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
              { label: 'In-App', value: 'inApp' }, { label: 'Push', value: 'push' },
              { label: 'Email', value: 'email' }, { label: 'SMS', value: 'sms' },
            ],
          },
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Notification title', required: true },
          { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Write the notification content...', rows: 3, required: true },
          { key: 'target', label: 'Target', type: 'text', placeholder: 'user_id' },
        ],
      },
    ],
  },

  // ─── ASSIGN AGENT ───
  {
    nodeType: 'assignAgent',
    sections: [
      {
        title: 'Agent Assignment',
        icon: '👤',
        fields: [
          {
            key: 'assignmentType', label: 'Assignment Type', type: 'select',
            options: [
              { label: 'Round Robin', value: 'roundRobin' }, { label: 'Least Busy', value: 'leastBusy' },
              { label: 'Specific Agent', value: 'specific' }, { label: 'By Skill', value: 'skill' },
            ],
          },
          {
            key: 'agentId', label: 'Agent ID', type: 'text', placeholder: 'agent_123',
            showWhen: { field: 'assignmentType', equals: 'specific' },
          },
          {
            key: 'skill', label: 'Skill', type: 'text', placeholder: 'billing',
            showWhen: { field: 'assignmentType', equals: 'skill' },
          },
        ],
      },
    ],
  },

  // ─── APPROVAL REQUEST ───
  {
    nodeType: 'approvalRequest',
    requiredFields: ['approverGroup', 'message'],
    sections: [
      {
        title: 'Approval',
        icon: '✅',
        fields: [
          { key: 'approverGroup', label: 'Approver Group', type: 'text', placeholder: 'managers', required: true },
          { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Please review and approve...', rows: 3, required: true },
          { key: 'timeoutMinutes', label: 'Timeout (minutes)', type: 'number', min: 0 },
          {
            key: 'onTimeout', label: 'On Timeout', type: 'select',
            options: [
              { label: 'Auto-Approve', value: 'autoApprove' },
              { label: 'Auto-Reject', value: 'autoReject' },
              { label: 'Escalate', value: 'escalate' },
            ],
          },
          {
            key: 'escalationTarget', label: 'Escalation Target', type: 'text', placeholder: 'team_lead',
            showWhen: { field: 'onTimeout', equals: 'escalate' },
          },
        ],
      },
    ],
  },

  // ─── HUMAN TAKEOVER ───
  {
    nodeType: 'humanTakeover',
    requiredFields: ['queue'],
    sections: [
      {
        title: 'Human Takeover',
        icon: '🤝',
        fields: [
          { key: 'queue', label: 'Queue', type: 'text', placeholder: 'support', required: true },
          {
            key: 'priority', label: 'Priority', type: 'select',
            options: [{ label: 'Low', value: 'low' }, { label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }],
          },
          { key: 'handoffMessage', label: 'Handoff Message', type: 'textarea', placeholder: 'A human agent will join shortly...', rows: 3 },
          { key: 'fallbackMessage', label: 'Fallback Message', type: 'textarea', placeholder: 'No agents available right now...', rows: 3 },
          { key: 'includeTranscript', label: 'Include transcript in handoff', type: 'checkbox' },
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
          { key: 'pIndex', label: 'Prompt Index (pIndex)', type: 'number', required: true },
          { key: 'promptKey', label: 'Key', type: 'text', placeholder: 'select_language', required: true },
          { key: 'language', label: 'Language', type: 'text', placeholder: 'ENGLISH', required: true },
          { key: 'text', label: 'Text', type: 'textarea', placeholder: 'Ask your question here...', rows: 3, required: true },
          {
            key: 'promptProps', label: 'Prompt Properties', type: 'select',
            options: [
              { label: 'Text Input', value: 'TEXT' },
              { label: 'Single Choice', value: 'SINGLE_CHOICE' },
              { label: 'Multi Choice', value: 'MULTI_CHOICE' },
              { label: 'Skippable', value: 'SKIPPABLE' },
              { label: 'Ending', value: 'ENDING' },
            ],
            // Treating this as a single select in the UI for simplicity, since it's an array of strings in JSON, we can export it properly.
          },
        ],
      },
      {
        title: 'Answers',
        icon: '🔘',
        fields: [
          {
            key: 'answers', label: 'Answers', type: 'answer-list', addLabel: '+ Add Answer',
            itemSchema: [
              { key: 'aIndex', label: 'Index', type: 'number' },
              { key: 'keyPattern', label: 'Pattern', type: 'text', placeholder: '1' },
              { key: 'keyPatternHuman', label: 'Human Pattern', type: 'text', placeholder: '1' },
              { key: 'text', label: 'Text', type: 'text', placeholder: 'Answer Text' },
              {
                key: 'props', label: 'Properties', type: 'select',
                options: [
                  { label: 'Button', value: 'BUTTON' },
                  { label: 'Radio', value: 'RADIO' },
                  { label: 'Option (Dropdown)', value: 'OPTION' }
                ]
              }
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
