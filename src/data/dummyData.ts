import { v4 as uuidv4 } from 'uuid';
import type { SimulationSession, SimulationResponse } from '../store/simulationStore';

// ─── Flow names for dummy data ───
const FLOW_NAMES = [
  'Customer Support Flow',
  'Lead Qualification Bot',
  'Appointment Booking',
  'Product Feedback Survey',
  'Onboarding Assistant',
  'FAQ Chatbot',
  'Order Status Tracker',
];

const PLATFORMS: SimulationSession['platform'][] = ['whatsapp', 'messenger', 'instagram', 'web', 'simulator'];
const STATUSES: SimulationSession['status'][] = ['completed', 'abandoned', 'in_progress'];

// ─── Sample questions/prompts for each flow ───
const FLOW_PROMPTS: Record<string, { nodeLabel: string; promptText: string; nodeType: string; variableName?: string; sampleAnswers: string[] }[]> = {
  'Customer Support Flow': [
    { nodeLabel: 'Welcome', promptText: 'Welcome! How can I help you today?', nodeType: 'questionnaire', sampleAnswers: ['Billing Issue', 'Technical Support', 'Account Help', 'Other'] },
    { nodeLabel: 'Get Name', promptText: 'May I know your name?', nodeType: 'questionnaire', variableName: 'user_name', sampleAnswers: ['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa'] },
    { nodeLabel: 'Get Email', promptText: 'Please provide your email address', nodeType: 'questionnaire', variableName: 'email', sampleAnswers: ['john@email.com', 'sarah@gmail.com', 'mike@outlook.com', 'emma@yahoo.com'] },
    { nodeLabel: 'Issue Description', promptText: 'Please describe your issue', nodeType: 'questionnaire', variableName: 'issue', sampleAnswers: ['Cannot login to my account', 'Payment not processing', 'App crashing on startup', 'Need to update billing info'] },
    { nodeLabel: 'Priority', promptText: 'How urgent is this issue?', nodeType: 'questionnaire', sampleAnswers: ['Low', 'Medium', 'High', 'Critical'] },
    { nodeLabel: 'Thank You', promptText: 'Thank you! A support agent will contact you shortly.', nodeType: 'text', sampleAnswers: [] },
  ],
  'Lead Qualification Bot': [
    { nodeLabel: 'Greeting', promptText: 'Hi there! Interested in our services?', nodeType: 'questionnaire', sampleAnswers: ['Yes', 'Tell me more', 'Maybe'] },
    { nodeLabel: 'Company Name', promptText: 'What is your company name?', nodeType: 'questionnaire', variableName: 'company', sampleAnswers: ['TechCorp', 'StartupXYZ', 'GlobalInc', 'LocalBiz', 'InnovateCo'] },
    { nodeLabel: 'Company Size', promptText: 'How many employees does your company have?', nodeType: 'questionnaire', sampleAnswers: ['1-10', '11-50', '51-200', '200+'] },
    { nodeLabel: 'Budget', promptText: 'What is your budget range?', nodeType: 'questionnaire', variableName: 'budget', sampleAnswers: ['$1K-$5K', '$5K-$20K', '$20K-$50K', '$50K+'] },
    { nodeLabel: 'Contact', promptText: 'Best phone number to reach you?', nodeType: 'questionnaire', variableName: 'phone', sampleAnswers: ['+1234567890', '+9876543210', '+1122334455'] },
    { nodeLabel: 'Summary', promptText: 'Great! Our team will reach out within 24 hours.', nodeType: 'text', sampleAnswers: [] },
  ],
  'Appointment Booking': [
    { nodeLabel: 'Welcome', promptText: 'Welcome to our booking system!', nodeType: 'text', sampleAnswers: [] },
    { nodeLabel: 'Service Type', promptText: 'What service would you like to book?', nodeType: 'questionnaire', sampleAnswers: ['Consultation', 'Follow-up', 'New Patient', 'Emergency'] },
    { nodeLabel: 'Preferred Date', promptText: 'When would you like to schedule?', nodeType: 'questionnaire', variableName: 'date', sampleAnswers: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    { nodeLabel: 'Preferred Time', promptText: 'What time works best for you?', nodeType: 'questionnaire', variableName: 'time', sampleAnswers: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] },
    { nodeLabel: 'Patient Name', promptText: 'Please enter your full name', nodeType: 'questionnaire', variableName: 'patient_name', sampleAnswers: ['Alex Johnson', 'Maria Garcia', 'James Wilson', 'Anna Lee'] },
    { nodeLabel: 'Confirmation', promptText: 'Your appointment has been booked!', nodeType: 'text', sampleAnswers: [] },
  ],
  'Product Feedback Survey': [
    { nodeLabel: 'Intro', promptText: 'We value your feedback! Ready to start?', nodeType: 'questionnaire', sampleAnswers: ['Sure!', 'Yes', 'OK'] },
    { nodeLabel: 'Rating', promptText: 'How would you rate our product?', nodeType: 'questionnaire', variableName: 'rating', sampleAnswers: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'] },
    { nodeLabel: 'Best Feature', promptText: 'What feature do you like the most?', nodeType: 'questionnaire', variableName: 'best_feature', sampleAnswers: ['Ease of use', 'Speed', 'Design', 'Customer support', 'Pricing'] },
    { nodeLabel: 'Improvement', promptText: 'What could we improve?', nodeType: 'questionnaire', variableName: 'improvement', sampleAnswers: ['More features', 'Better docs', 'Lower pricing', 'Mobile app', 'Faster loading'] },
    { nodeLabel: 'Recommend', promptText: 'Would you recommend us to a friend?', nodeType: 'questionnaire', variableName: 'recommend', sampleAnswers: ['Definitely', 'Maybe', 'Not sure'] },
    { nodeLabel: 'Thanks', promptText: 'Thank you for your feedback!', nodeType: 'text', sampleAnswers: [] },
  ],
  'Onboarding Assistant': [
    { nodeLabel: 'Welcome', promptText: 'Welcome aboard! Let us get you set up.', nodeType: 'text', sampleAnswers: [] },
    { nodeLabel: 'Role', promptText: 'What is your role?', nodeType: 'questionnaire', variableName: 'role', sampleAnswers: ['Developer', 'Designer', 'Manager', 'Marketing', 'Sales'] },
    { nodeLabel: 'Experience', promptText: 'How familiar are you with similar tools?', nodeType: 'questionnaire', variableName: 'experience', sampleAnswers: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    { nodeLabel: 'Goals', promptText: 'What do you hope to achieve?', nodeType: 'questionnaire', variableName: 'goal', sampleAnswers: ['Automate workflows', 'Build chatbots', 'Customer support', 'Lead generation'] },
    { nodeLabel: 'Setup Complete', promptText: 'You are all set! Check your dashboard to get started.', nodeType: 'text', sampleAnswers: [] },
  ],
  'FAQ Chatbot': [
    { nodeLabel: 'Hello', promptText: 'Hi! What would you like to know?', nodeType: 'questionnaire', sampleAnswers: ['Pricing', 'Features', 'Support', 'Getting Started'] },
    { nodeLabel: 'Sub-topic', promptText: 'Could you be more specific?', nodeType: 'questionnaire', sampleAnswers: ['Free plan', 'Enterprise', 'API access', 'Integrations', 'Trial period'] },
    { nodeLabel: 'Answer', promptText: 'Here is the information you requested...', nodeType: 'text', sampleAnswers: [] },
    { nodeLabel: 'Helpful?', promptText: 'Was this helpful?', nodeType: 'questionnaire', sampleAnswers: ['Yes, thanks!', 'No, I need more help', 'Partially'] },
    { nodeLabel: 'Goodbye', promptText: 'Thank you for using our FAQ bot!', nodeType: 'text', sampleAnswers: [] },
  ],
  'Order Status Tracker': [
    { nodeLabel: 'Greeting', promptText: 'Hello! Want to check your order status?', nodeType: 'questionnaire', sampleAnswers: ['Yes', 'Track Order', 'Check Status'] },
    { nodeLabel: 'Order ID', promptText: 'Please enter your Order ID', nodeType: 'questionnaire', variableName: 'order_id', sampleAnswers: ['ORD-1234', 'ORD-5678', 'ORD-9012', 'ORD-3456', 'ORD-7890'] },
    { nodeLabel: 'Verify Email', promptText: 'Please enter the email used for the order', nodeType: 'questionnaire', variableName: 'verify_email', sampleAnswers: ['user@email.com', 'buyer@gmail.com', 'customer@outlook.com'] },
    { nodeLabel: 'Status Result', promptText: 'Your order is currently: In Transit', nodeType: 'text', sampleAnswers: [] },
    { nodeLabel: 'More Help', promptText: 'Need anything else?', nodeType: 'questionnaire', sampleAnswers: ['No, thanks', 'Talk to agent', 'Track another order'] },
  ],
};

// ─── Drop-off nodes ───
const DROP_OFF_NODES = [
  'Get Email', 'Issue Description', 'Budget', 'Contact', 'Company Size',
  'Preferred Date', 'Improvement', 'Order ID', 'Verify Email', 'Sub-topic',
];

// ─── Random helpers ───
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function randomDate(daysAgo: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

// ─── Generate dummy sessions ───
export function generateDummyData(): SimulationSession[] {
  const sessions: SimulationSession[] = [];

  for (let i = 0; i < 65; i++) {
    const flowName = pick(FLOW_NAMES);
    const flowId = `flow_${flowName.toLowerCase().replace(/\s+/g, '_')}`;
    const platform = pick(PLATFORMS);
    const startDate = randomDate(30);

    // Weighted status: 55% completed, 35% abandoned, 10% in_progress
    const statusRand = Math.random();
    const status: SimulationSession['status'] =
      statusRand < 0.55 ? 'completed' : statusRand < 0.90 ? 'abandoned' : 'in_progress';

    const prompts = FLOW_PROMPTS[flowName] || FLOW_PROMPTS['Customer Support Flow'];
    const totalNodes = prompts.length;

    // How many nodes the user visited
    const visitedNodes = status === 'completed'
      ? totalNodes
      : status === 'abandoned'
        ? randInt(1, totalNodes - 1)
        : randInt(1, totalNodes);

    // Build responses
    const responses: SimulationResponse[] = [];
    const variables: Record<string, string> = {};

    for (let j = 0; j < visitedNodes; j++) {
      const prompt = prompts[j];
      if (!prompt) break;

      if (prompt.sampleAnswers.length > 0) {
        const answer = pick(prompt.sampleAnswers);
        const ts = new Date(startDate.getTime() + (j + 1) * randInt(5000, 30000));

        responses.push({
          nodeId: `node_${j}`,
          nodeLabel: prompt.nodeLabel,
          nodeType: prompt.nodeType,
          promptText: prompt.promptText,
          userResponse: answer,
          timestamp: ts.toISOString(),
          variableName: prompt.variableName,
        });

        if (prompt.variableName) {
          variables[prompt.variableName] = answer;
        }
      }
    }

    const lastPrompt = prompts[Math.min(visitedNodes - 1, prompts.length - 1)];
    const endDate = status !== 'in_progress'
      ? new Date(startDate.getTime() + visitedNodes * randInt(10000, 60000))
      : null;

    sessions.push({
      id: uuidv4(),
      flowId,
      flowName,
      platform,
      startedAt: startDate.toISOString(),
      endedAt: endDate?.toISOString() || null,
      status,
      completionPercentage: status === 'completed' ? 100 : Math.round((visitedNodes / totalNodes) * 100),
      lastNodeId: `node_${visitedNodes - 1}`,
      lastNodeLabel: status === 'abandoned' ? pick(DROP_OFF_NODES) : (lastPrompt?.nodeLabel || 'End'),
      responses,
      variables,
      totalNodes,
      visitedNodes,
    });
  }

  // Sort by date descending
  sessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return sessions;
}
