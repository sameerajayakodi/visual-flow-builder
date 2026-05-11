import { flowToSteps } from './src/utils/flowAdapter.js';
import { EXAMPLE_FLOWS } from './src/templates/exampleFlows.js';

const flow = EXAMPLE_FLOWS.switch_usecase;
const steps = flowToSteps(flow.nodes, flow.edges);

console.log(JSON.stringify(steps, null, 2));
