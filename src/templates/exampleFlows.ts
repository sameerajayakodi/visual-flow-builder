// ─── Example Templates ───
// Uses ALL node types: trigger, text, button, card, questionnaire (prompt),
// condition, delay, httpRequest, sendEmail, notification, end, notes

export const EXAMPLE_FLOWS: Record<string, any> = {

  // ══════════════════════════════════════════════
  // 1. CUSTOMER SUPPORT — button, text, end
  // ══════════════════════════════════════════════
  customer_support: {
    flowId: 'customer-support',
    name: 'Customer Support Bot',
    version: 1,
    status: 'draft',
    nodes: [
      { id: 't1', type: 'trigger', position: { x: 400, y: 50 }, data: { label: 'Chat Starts', nodeType: 'trigger', category: 'trigger', icon: '⚡', isConfigured: true, hasError: false } },
      { id: 'welcome', type: 'text', position: { x: 400, y: 180 }, data: { label: 'Welcome', nodeType: 'text', category: 'message', icon: '💬', isConfigured: true, hasError: false, message: 'Hello! Welcome to support. How can we help?' } },
      { id: 'dept', type: 'questionnaire', position: { x: 400, y: 340 }, data: { label: 'Choose Dept', nodeType: 'questionnaire', category: 'message', icon: '📋', isConfigured: true, hasError: false, text: 'Select a department:', promptProps: ['SINGLE_CHOICE'], inputFormat: 'button', answers: [
        { id: 'btn_sup', aIndex: 1, text: 'Support', props: ['BUTTON'] },
        { id: 'btn_sal', aIndex: 2, text: 'Sales', props: ['BUTTON'] },
        { id: 'btn_hr', aIndex: 3, text: 'HR', props: ['BUTTON'] },
      ] } },
      { id: 'sup_msg', type: 'text', position: { x: 100, y: 530 }, data: { label: 'Support Reply', nodeType: 'text', category: 'message', icon: '💬', isConfigured: true, hasError: false, message: 'Our support team will assist you shortly.' } },
      { id: 'sal_msg', type: 'text', position: { x: 400, y: 530 }, data: { label: 'Sales Reply', nodeType: 'text', category: 'message', icon: '💬', isConfigured: true, hasError: false, message: 'A sales rep will contact you soon!' } },
      { id: 'hr_msg', type: 'text', position: { x: 700, y: 530 }, data: { label: 'HR Reply', nodeType: 'text', category: 'message', icon: '💬', isConfigured: true, hasError: false, message: 'Please describe your HR inquiry.' } },
      { id: 'end1', type: 'end', position: { x: 400, y: 700 }, data: { label: 'End', nodeType: 'end', category: 'utility', icon: '🏁', isConfigured: true, hasError: false, endType: 'complete' } },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 'welcome', type: 'smoothstep', animated: true },
      { id: 'e2', source: 'welcome', target: 'dept', type: 'smoothstep', animated: true },
      { id: 'e3', source: 'dept', sourceHandle: 'btn_sup', target: 'sup_msg', type: 'smoothstep', animated: true },
      { id: 'e4', source: 'dept', sourceHandle: 'btn_sal', target: 'sal_msg', type: 'smoothstep', animated: true },
      { id: 'e5', source: 'dept', sourceHandle: 'btn_hr', target: 'hr_msg', type: 'smoothstep', animated: true },
      { id: 'e6', source: 'sup_msg', target: 'end1', type: 'smoothstep', animated: true },
      { id: 'e7', source: 'sal_msg', target: 'end1', type: 'smoothstep', animated: true },
      { id: 'e8', source: 'hr_msg', target: 'end1', type: 'smoothstep', animated: true },
    ],
    variables: {},
    metadata: { description: 'Simple support bot with button-based department routing.' },
  },

  // ══════════════════════════════════════════════
  // 2. LEAD GENERATION — questionnaire (TEXT mode), card, condition, httpRequest, sendEmail, delay, notification
  // ══════════════════════════════════════════════
  lead_generation: {
    flowId: 'lead-gen',
    name: 'Lead Generation Funnel',
    version: 1,
    status: 'draft',
    nodes: [
      { id: 't1', type: 'trigger', position: { x: 420, y: 30 }, data: { label: 'Visitor Arrives', nodeType: 'trigger', category: 'trigger', icon: '⚡', isConfigured: true, hasError: false, triggerType: 'manual' } },
      { id: 'greet', type: 'text', position: { x: 420, y: 160 }, data: { label: 'Greeting', nodeType: 'text', category: 'message', icon: '💬', isConfigured: true, hasError: false, message: 'Hi! Want a free quote? Let us know your details.' } },
      { id: 'get_name', type: 'questionnaire', position: { x: 420, y: 310 }, data: { label: 'Get Name', nodeType: 'questionnaire', category: 'message', icon: '📋', isConfigured: true, hasError: false, text: 'What is your name?', promptProps: ['TEXT'], language: 'ENGLISH', variableName: 'lead_name', inputType: 'text', answers: [] } },
      { id: 'get_email', type: 'questionnaire', position: { x: 420, y: 460 }, data: { label: 'Get Email', nodeType: 'questionnaire', category: 'message', icon: '📋', isConfigured: true, hasError: false, text: 'And your email?', promptProps: ['TEXT'], language: 'ENGLISH', variableName: 'lead_email', inputType: 'email', answers: [] } },
      { id: 'interest', type: 'questionnaire', position: { x: 420, y: 610 }, data: { label: 'Service Interest', nodeType: 'questionnaire', category: 'message', icon: '📋', isConfigured: true, hasError: false, text: 'Choose the service that fits your needs.', promptProps: ['SINGLE_CHOICE'], inputFormat: 'button', answers: [
        { id: 'btn_basic', aIndex: 1, text: 'Basic Plan', props: ['BUTTON'] },
        { id: 'btn_pro', aIndex: 2, text: 'Pro Plan', props: ['BUTTON'] },
        { id: 'btn_ent', aIndex: 3, text: 'Enterprise', props: ['BUTTON'] },
      ] } },
      { id: 'check_ent', type: 'condition', position: { x: 420, y: 800 }, data: { label: 'Enterprise?', nodeType: 'condition', category: 'logic', icon: '🔀', isConfigured: true, hasError: false, combinator: 'and', rules: [{ field: 'interest', operator: 'equals', value: 'enterprise' }] } },
      { id: 'api_crm', type: 'httpRequest', position: { x: 150, y: 970 }, data: { label: 'Save to CRM', nodeType: 'httpRequest', category: 'action', icon: '🌐', isConfigured: true, hasError: false, method: 'POST', url: 'https://api.crm.com/leads', body: '{"name":"{{lead_name}}","email":"{{lead_email}}"}', responseVariable: 'crm_response' } },
      { id: 'send_mail', type: 'sendEmail', position: { x: 150, y: 1140 }, data: { label: 'Send Quote', nodeType: 'sendEmail', category: 'action', icon: '📧', isConfigured: true, hasError: false, to: '{{lead_email}}', subject: 'Your personalized quote', body: 'Hi {{lead_name}}, here is your enterprise quote...', isHtml: false } },
      { id: 'notify_sales', type: 'notification', position: { x: 690, y: 970 }, data: { label: 'Notify Sales', nodeType: 'notification', category: 'action', icon: '🔔', isConfigured: true, hasError: false, channel: 'push', title: 'New Lead!', message: '{{lead_name}} signed up for {{interest}}', target: 'sales-team' } },
      { id: 'wait_1d', type: 'delay', position: { x: 690, y: 1140 }, data: { label: 'Wait 1 Day', nodeType: 'delay', category: 'logic', icon: '⏱️', isConfigured: true, hasError: false, duration: 1, unit: 'hours' } },
      { id: 'followup', type: 'text', position: { x: 690, y: 1290 }, data: { label: 'Follow Up', nodeType: 'text', category: 'message', icon: '💬', isConfigured: true, hasError: false, message: 'Hi {{lead_name}}, just checking in! Any questions?' } },
      { id: 'end1', type: 'end', position: { x: 420, y: 1440 }, data: { label: 'End', nodeType: 'end', category: 'utility', icon: '🏁', isConfigured: true, hasError: false, endType: 'complete' } },
      { id: 'note1', type: 'notes', position: { x: 750, y: 30 }, data: { label: 'Notes', nodeType: 'notes', category: 'utility', icon: '📝', isConfigured: true, hasError: false, content: 'This flow captures leads, saves to CRM, and follows up automatically.', color: '#dbeafe' } },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 'greet', type: 'smoothstep', animated: true },
      { id: 'e2', source: 'greet', target: 'get_name', type: 'smoothstep', animated: true },
      { id: 'e3', source: 'get_name', target: 'get_email', type: 'smoothstep', animated: true },
      { id: 'e4', source: 'get_email', target: 'interest', type: 'smoothstep', animated: true },
      { id: 'e5', source: 'interest', sourceHandle: 'btn_ent', target: 'check_ent', type: 'smoothstep', animated: true },
      { id: 'e5b', source: 'interest', sourceHandle: 'btn_basic', target: 'notify_sales', type: 'smoothstep', animated: true },
      { id: 'e5c', source: 'interest', sourceHandle: 'btn_pro', target: 'notify_sales', type: 'smoothstep', animated: true },
      { id: 'e6', source: 'check_ent', sourceHandle: 'yes', target: 'api_crm', type: 'smoothstep', animated: true },
      { id: 'e7', source: 'check_ent', sourceHandle: 'no', target: 'notify_sales', type: 'smoothstep', animated: true },
      { id: 'e8', source: 'api_crm', target: 'send_mail', type: 'smoothstep', animated: true },
      { id: 'e9', source: 'send_mail', target: 'end1', type: 'smoothstep', animated: true },
      { id: 'e10', source: 'notify_sales', target: 'wait_1d', type: 'smoothstep', animated: true },
      { id: 'e11', source: 'wait_1d', target: 'followup', type: 'smoothstep', animated: true },
      { id: 'e12', source: 'followup', target: 'end1', type: 'smoothstep', animated: true },
    ],
    variables: {},
    metadata: { description: 'Full lead funnel: collect info → card → condition → API → email → notification → delay → follow up.' },
  },

  // ══════════════════════════════════════════════
  // 3. LANGUAGE SURVEY — questionnaire nodes (senior engineer format)
  // ══════════════════════════════════════════════
  language_survey: {
    flowId: 'language-survey',
    name: 'Multi-Language Survey',
    version: 1,
    status: 'draft',
    nodes: [
      { id: 't1', type: 'trigger', position: { x: 400, y: 40 }, data: { label: 'Survey Start', nodeType: 'trigger', category: 'trigger', icon: '⚡', isConfigured: true, hasError: false } },
      { id: 'q_lang', type: 'questionnaire', position: { x: 400, y: 190 }, data: { label: 'Select Language', nodeType: 'questionnaire', category: 'message', icon: '📋', isConfigured: true, hasError: false, promptKey: 'select_language', language: 'ENGLISH', text: 'Please select your preferred language.', promptProps: ['SINGLE_CHOICE'], inputFormat: 'button', answers: [
        { id: 'ans_en', aIndex: 1, text: 'ENGLISH', props: ['BUTTON'] },
        { id: 'ans_ta', aIndex: 2, text: 'TAMIL', props: ['BUTTON'] },
      ] } },
      { id: 'q_age', type: 'questionnaire', position: { x: 400, y: 400 }, data: { label: 'Age Range', nodeType: 'questionnaire', category: 'message', icon: '📋', isConfigured: true, hasError: false, promptKey: 'age_range', language: 'ENGLISH', text: 'What is your age range?', promptProps: ['SINGLE_CHOICE'], inputFormat: 'dropdown', answers: [
        { id: 'ans_u18', aIndex: 1, text: '0 - 17', props: ['DROPDOWN'] },
        { id: 'ans_1825', aIndex: 2, text: '18 - 25', props: ['DROPDOWN'] },
        { id: 'ans_2640', aIndex: 3, text: '26 - 40', props: ['DROPDOWN'] },
      ] } },
      { id: 'q_feedback', type: 'questionnaire', position: { x: 650, y: 620 }, data: { label: 'Service Rating', nodeType: 'questionnaire', category: 'message', icon: '📋', isConfigured: true, hasError: false, promptKey: 'user_feedback', language: 'ENGLISH', text: 'Since you are an adult, how would you rate our service?', promptProps: ['SINGLE_CHOICE'], inputFormat: 'radio', answers: [
        { id: 'ans_good', aIndex: 1, text: 'Good', props: ['RADIO'] },
        { id: 'ans_avg', aIndex: 2, text: 'Average', props: ['RADIO'] },
        { id: 'ans_bad', aIndex: 3, text: 'Bad', props: ['RADIO'] },
      ] } },
      { id: 'q_end', type: 'questionnaire', position: { x: 400, y: 840 }, data: { label: 'Thank You', nodeType: 'questionnaire', category: 'message', icon: '📋', isConfigured: true, hasError: false, promptKey: 'end_thank_you', language: 'ENGLISH', text: 'Thank you for participating! Goodbye.', promptProps: ['ENDING'], answers: [] } },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 'q_lang', type: 'smoothstep', animated: true },
      { id: 'e2a', source: 'q_lang', sourceHandle: 'ans_en', target: 'q_age', type: 'smoothstep', animated: true },
      { id: 'e2b', source: 'q_lang', sourceHandle: 'ans_ta', target: 'q_age', type: 'smoothstep', animated: true },
      { id: 'e3a', source: 'q_age', sourceHandle: 'ans_u18', target: 'q_end', type: 'smoothstep', animated: true },
      { id: 'e3b', source: 'q_age', sourceHandle: 'ans_1825', target: 'q_feedback', type: 'smoothstep', animated: true },
      { id: 'e3c', source: 'q_age', sourceHandle: 'ans_2640', target: 'q_feedback', type: 'smoothstep', animated: true },
      { id: 'e4a', source: 'q_feedback', sourceHandle: 'ans_good', target: 'q_end', type: 'smoothstep', animated: true },
      { id: 'e4b', source: 'q_feedback', sourceHandle: 'ans_avg', target: 'q_end', type: 'smoothstep', animated: true },
      { id: 'e4c', source: 'q_feedback', sourceHandle: 'ans_bad', target: 'q_end', type: 'smoothstep', animated: true },
    ],
    variables: {},
    metadata: { description: 'Structured survey matching senior engineer JSON format with branching by age.' },
  },

  // ══════════════════════════════════════════════
  // 4. ORDER NOTIFICATION — card, delay, httpRequest, sendEmail, notification, condition
  // ══════════════════════════════════════════════
  order_notification: {
    flowId: 'order-notify',
    name: 'Order Status Pipeline',
    version: 1,
    status: 'draft',
    nodes: [
      { id: 't1', type: 'trigger', position: { x: 400, y: 40 }, data: { label: 'Order Placed', nodeType: 'trigger', category: 'trigger', icon: '⚡', isConfigured: true, hasError: false, triggerType: 'webhook' } },
      { id: 'confirm', type: 'text', position: { x: 400, y: 180 }, data: { label: 'Confirm Order', nodeType: 'text', category: 'message', icon: '💬', isConfigured: true, hasError: false, message: 'Your order #{{order_id}} has been received!' } },
      { id: 'api_inv', type: 'httpRequest', position: { x: 400, y: 340 }, data: { label: 'Check Inventory', nodeType: 'httpRequest', category: 'action', icon: '🌐', isConfigured: true, hasError: false, method: 'GET', url: 'https://api.store.com/inventory/{{product_id}}', responseVariable: 'stock' } },
      { id: 'check_stock', type: 'condition', position: { x: 400, y: 510 }, data: { label: 'In Stock?', nodeType: 'condition', category: 'logic', icon: '🔀', isConfigured: true, hasError: false, combinator: 'and', rules: [{ field: 'stock.available', operator: 'greaterThan', value: '0' }] } },
      { id: 'email_confirm', type: 'sendEmail', position: { x: 150, y: 690 }, data: { label: 'Ship Confirmation', nodeType: 'sendEmail', category: 'action', icon: '📧', isConfigured: true, hasError: false, to: '{{customer_email}}', subject: 'Order Shipped!', body: 'Hi {{customer_name}}, your order is on its way!', isHtml: false } },
      { id: 'wait_ship', type: 'delay', position: { x: 150, y: 850 }, data: { label: 'Wait 2 Days', nodeType: 'delay', category: 'logic', icon: '⏱️', isConfigured: true, hasError: false, duration: 2, unit: 'hours' } },
      { id: 'delivery_note', type: 'notification', position: { x: 150, y: 1010 }, data: { label: 'Delivery Push', nodeType: 'notification', category: 'action', icon: '🔔', isConfigured: true, hasError: false, channel: 'push', title: 'Delivered!', message: 'Your order #{{order_id}} was delivered.', target: '{{customer_id}}' } },
      { id: 'rate_card', type: 'questionnaire', position: { x: 150, y: 1180 }, data: { label: 'Rate Experience', nodeType: 'questionnaire', category: 'message', icon: '📋', isConfigured: true, hasError: false, text: 'Rate your experience', promptProps: ['SINGLE_CHOICE'], inputFormat: 'button', answers: [
        { id: 'btn_5star', aIndex: 1, text: '⭐ 5 Stars', props: ['BUTTON'] },
        { id: 'btn_3star', aIndex: 2, text: '⭐ 3 Stars', props: ['BUTTON'] },
        { id: 'btn_1star', aIndex: 3, text: '⭐ 1 Star', props: ['BUTTON'] },
      ] } },
      { id: 'backorder', type: 'text', position: { x: 650, y: 690 }, data: { label: 'Backorder Notice', nodeType: 'text', category: 'message', icon: '💬', isConfigured: true, hasError: false, message: 'Sorry, your item is out of stock. We will notify you when it is available.' } },
      { id: 'end1', type: 'end', position: { x: 400, y: 1380 }, data: { label: 'End', nodeType: 'end', category: 'utility', icon: '🏁', isConfigured: true, hasError: false, endType: 'complete' } },
      { id: 'note1', type: 'notes', position: { x: 750, y: 40 }, data: { label: 'Notes', nodeType: 'notes', category: 'utility', icon: '📝', isConfigured: true, hasError: false, content: 'Order pipeline: confirm → check stock → ship or backorder → deliver → rate.', color: '#dcfce7' } },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 'confirm', type: 'smoothstep', animated: true },
      { id: 'e2', source: 'confirm', target: 'api_inv', type: 'smoothstep', animated: true },
      { id: 'e3', source: 'api_inv', target: 'check_stock', type: 'smoothstep', animated: true },
      { id: 'e4', source: 'check_stock', sourceHandle: 'yes', target: 'email_confirm', type: 'smoothstep', animated: true },
      { id: 'e5', source: 'check_stock', sourceHandle: 'no', target: 'backorder', type: 'smoothstep', animated: true },
      { id: 'e6', source: 'email_confirm', target: 'wait_ship', type: 'smoothstep', animated: true },
      { id: 'e7', source: 'wait_ship', target: 'delivery_note', type: 'smoothstep', animated: true },
      { id: 'e8', source: 'delivery_note', target: 'rate_card', type: 'smoothstep', animated: true },
      { id: 'e9a', source: 'rate_card', sourceHandle: 'btn_5star', target: 'end1', type: 'smoothstep', animated: true },
      { id: 'e9b', source: 'rate_card', sourceHandle: 'btn_3star', target: 'end1', type: 'smoothstep', animated: true },
      { id: 'e9c', source: 'rate_card', sourceHandle: 'btn_1star', target: 'end1', type: 'smoothstep', animated: true },
      { id: 'e10', source: 'backorder', target: 'end1', type: 'smoothstep', animated: true },
    ],
    variables: {},
    metadata: { description: 'Full order pipeline: API check → condition → email → delay → notification → card rating.' },
  },
};
