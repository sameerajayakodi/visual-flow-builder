import FlowNode from './FlowNode';

export const nodeTypes = {
  trigger: FlowNode,
  text: FlowNode,
  button: FlowNode,
  media: FlowNode,
  card: FlowNode,
  carousel: FlowNode,
  form: FlowNode,
  inputRequest: FlowNode,
  condition: FlowNode,
  switch: FlowNode,
  delay: FlowNode,
  randomSplit: FlowNode,
  loop: FlowNode,
  httpRequest: FlowNode,
  saveVariable: FlowNode,
  sendEmail: FlowNode,
  aiPrompt: FlowNode,
  databaseAction: FlowNode,
  notification: FlowNode,
  assignAgent: FlowNode,
  approvalRequest: FlowNode,
  humanTakeover: FlowNode,
  notes: FlowNode,
  end: FlowNode,
};

export { FlowNode };
