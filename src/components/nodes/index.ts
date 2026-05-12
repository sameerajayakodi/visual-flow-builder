import FlowNode from './FlowNode';

export const nodeTypes = {
  trigger: FlowNode,
  text: FlowNode,
  button: FlowNode,
  card: FlowNode,
  questionnaire: FlowNode,
  condition: FlowNode,
  delay: FlowNode,
  httpRequest: FlowNode,
  sendEmail: FlowNode,
  notification: FlowNode,
  end: FlowNode,
  notes: FlowNode,
  getInput: FlowNode,
  dbSave: FlowNode,
};

export { FlowNode };
