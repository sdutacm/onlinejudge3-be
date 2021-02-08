import { Agent } from 'midway';

module.exports = (agent: Agent) => {
  agent.messenger.on('egg-ready', () => {});

  agent.messenger.on('req-worker-pids', (data: { fromPid: number }) => {
    const { fromPid } = data;
    // console.log('agent req-worker-pids', fromPid);
    agent.messenger.sendTo(fromPid, 'resp-worker-pids', agent.messenger.opids);
  });
};
