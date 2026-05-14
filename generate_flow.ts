import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const flowId = 'saas-campaign-001';
const nodes: any[] = [];
const edges: any[] = [];

let nextY = 100;
function addNode(type: string, id: string, data: any, x: number, y: number) {
  nodes.push({
    id,
    type,
    position: { x, y },
    data: {
      ...data,
      nodeType: type,
      isConfigured: true,
      hasError: false
    }
  });
}

function addEdge(source: string, target: string, sourceHandle = 'source', targetHandle = 'target', label?: string) {
  edges.push({
    id: `edge_${uuidv4().slice(0, 8)}`,
    source,
    target,
    sourceHandle,
    targetHandle,
    type: 'labeled',
    animated: true,
    label,
    markerEnd: { type: 'arrowclosed', width: 16, height: 16 },
    style: { strokeWidth: 2 }
  });
}

// 0. Trigger
addNode('trigger', 'node_trigger', {
  label: 'Start Campaign',
  description: 'Entry point for campaign',
  triggerType: 'keyword',
  config: { keyword: 'start_campaign' }
}, 400, 100);

// 1. Text
addNode('text', 'node_welcome', {
  label: 'Welcome',
  message: '👋 Welcome to *NimbusFlow*, the #1 AI Workflow Automation tool!\n\nWe\'re excited to help you scale.'
}, 400, 250);
addEdge('node_trigger', 'node_welcome');

// 2. Questionnaire (Name)
addNode('questionnaire', 'node_name', {
  label: 'Get Name',
  promptKey: 'q_name',
  text: 'Before we begin, what should I call you?',
  variableName: 'user_name',
  inputFormat: 'text',
  inputType: 'text'
}, 400, 400);
addEdge('node_welcome', 'node_name');

// 3. Questionnaire (Email)
addNode('questionnaire', 'node_email', {
  label: 'Get Email',
  promptKey: 'q_email',
  text: 'Nice to meet you, {{user_name}}! What is your best work email address?',
  variableName: 'user_email',
  inputFormat: 'text',
  inputType: 'email'
}, 400, 550);
addEdge('node_name', 'node_email');

// 4. DB Save
addNode('dbSave', 'node_dbsave', {
  label: 'Save Lead to CRM',
  collection: 'leads',
  operation: 'insert',
  fields: [
    { id: 'f1', name: 'name', type: 'text', value: '{{user_name}}' },
    { id: 'f2', name: 'email', type: 'text', value: '{{user_email}}' },
    { id: 'f3', name: 'status', type: 'text', value: 'new' }
  ]
}, 400, 700);
addEdge('node_email', 'node_dbsave');

// 5. Questionnaire (Role)
addNode('questionnaire', 'node_role', {
  label: 'Select Role',
  promptKey: 'q_role',
  text: 'What is your primary role at your company?',
  variableName: 'user_role',
  inputFormat: 'button',
  answers: [
    { id: 'ans_dev', aIndex: 1, text: '👨‍💻 Developer', value: 'developer' },
    { id: 'ans_mkt', aIndex: 2, text: '📈 Marketer', value: 'marketer' },
    { id: 'ans_fnd', aIndex: 3, text: '🚀 Founder/CEO', value: 'founder' }
  ]
}, 400, 850);
addEdge('node_dbsave', 'node_role');

// Branch 1: Developer -> HttpRequest -> Delay -> Card
addNode('httpRequest', 'node_api', {
  label: 'Generate API Key',
  method: 'POST',
  url: 'https://api.nimbusflow.com/v1/generate-key',
  headers: [{ id: 'h1', key: 'Content-Type', value: 'application/json' }],
  body: '{"email": "{{user_email}}", "role": "developer"}',
  saveResponse: true,
  responseVariable: 'api_key'
}, 100, 1050);
addEdge('node_role', 'node_api', 'ans_dev', 'target', '👨‍💻 Developer');

addNode('delay', 'node_delay1', {
  label: 'Wait for provision',
  duration: 3,
  unit: 'seconds'
}, 100, 1200);
addEdge('node_api', 'node_delay1');

addNode('card', 'node_dev_card', {
  label: 'Developer Hub',
  title: 'API Keys Ready',
  subtitle: 'Start building integrations',
  body: 'Your API key is generated: {{api_key}}\nCheck out our docs to begin.',
  imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  buttons: [
    { id: 'btn_docs', label: 'View API Docs', value: 'docs', action: 'url', url: 'https://docs.nimbusflow.com' },
    { id: 'btn_dev_next', label: 'Continue', value: 'continue', action: 'postback' }
  ]
}, 100, 1350);
addEdge('node_delay1', 'node_dev_card');

// Branch 2: Marketer -> GetInput -> Notification
addNode('getInput', 'node_upload', {
  label: 'Upload Campaign Assets',
  promptMessage: 'Please upload a sample brand logo or campaign banner so we can customize your dashboard.',
  mediaType: 'image',
  variableName: 'brand_asset'
}, 400, 1050);
addEdge('node_role', 'node_upload', 'ans_mkt', 'target', '📈 Marketer');

addNode('notification', 'node_notify_mkt', {
  label: 'Alert Sales Team',
  title: 'New Marketer Lead',
  message: '{{user_name}} just signed up and uploaded a brand asset!',
  channels: { push: true, email: false, sms: false }
}, 400, 1200);
addEdge('node_upload', 'node_notify_mkt');

// Branch 3: Founder -> Condition (Company size)
addNode('questionnaire', 'node_company_size', {
  label: 'Company Size',
  promptKey: 'q_size',
  text: 'How large is your team?',
  variableName: 'team_size',
  inputFormat: 'list',
  answers: [
    { id: 'ans_small', aIndex: 1, text: '1-10', value: 'small' },
    { id: 'ans_med', aIndex: 2, text: '11-50', value: 'medium' },
    { id: 'ans_large', aIndex: 3, text: '51+', value: 'large' }
  ]
}, 700, 1050);
addEdge('node_role', 'node_company_size', 'ans_fnd', 'target', '🚀 Founder/CEO');

addNode('condition', 'node_condition_founder', {
  label: 'Evaluate Deal Size',
  conditionType: 'rules',
  rules: [
    { id: 'rule_large', field: 'team_size', operator: 'equals', value: 'large' }
  ]
}, 700, 1250);
addEdge('node_company_size', 'node_condition_founder', 'ans_small', 'target');
addEdge('node_company_size', 'node_condition_founder', 'ans_med', 'target');
addEdge('node_company_size', 'node_condition_founder', 'ans_large', 'target');

addNode('sendEmail', 'node_email_founder', {
  label: 'Email Enterprise Sales',
  to: 'enterprise@nimbusflow.com',
  subject: 'HOT LEAD: {{user_name}} (51+ employees)',
  body: 'Reach out to {{user_email}} ASAP. High value founder lead.'
}, 900, 1450);
// connect rule match
addEdge('node_condition_founder', 'node_email_founder', 'rule_large', 'target', 'Is Large');

addNode('text', 'node_text_founder', {
  label: 'Founder Welcome',
  message: 'Welcome aboard! We\'ve tailored your dashboard for team collaboration and OKR tracking.'
}, 700, 1450);
// connect fallback
addEdge('node_condition_founder', 'node_text_founder', 'fallback', 'target', 'Else');
// reconnect email back to flow
addEdge('node_email_founder', 'node_text_founder');

// Merge all paths to Final Step
addNode('sendEmail', 'node_welcome_email', {
  label: 'Send Welcome Email',
  to: '{{user_email}}',
  subject: 'Welcome to NimbusFlow!',
  body: 'Hi {{user_name}},\n\nWe are thrilled to have you! Click here to login: https://app.nimbusflow.com'
}, 400, 1650);
addEdge('node_dev_card', 'node_welcome_email', 'btn_dev_next');
addEdge('node_notify_mkt', 'node_welcome_email');
addEdge('node_text_founder', 'node_welcome_email');

// Ending
addNode('questionnaire', 'node_ending', {
  label: 'Flow Complete',
  promptKey: 'q_end',
  text: 'All set! Check your inbox at {{user_email}} for the next steps. Have a wonderful day!',
  promptProps: ['ENDING']
}, 400, 1800);
addEdge('node_welcome_email', 'node_ending');

addNode('end', 'node_end', {
  label: 'End Session',
  endType: 'complete'
}, 400, 1950);
addEdge('node_ending', 'node_end');

const flowData = {
  flowId,
  name: 'SaaS Onboarding & Lead Gen Campaign',
  version: 1,
  status: 'draft',
  nodes,
  edges,
  variables: {}
};

fs.writeFileSync('saas_campaign_flow.json', JSON.stringify(flowData, null, 2));
console.log('Done!');
