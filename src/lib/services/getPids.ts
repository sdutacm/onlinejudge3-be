import { Application } from 'egg';

export function getWorkerPids(app: Application): Promise<number[]> {
  return new Promise((rs, rj) => {
    const timer = setTimeout(() => {
      rj(new Error('getWorkerPids timeout'));
    }, 5000);
    const onResp = (pids: number[]) => {
      clearTimeout(timer);
      // console.log('getWorkerPids', pids);
      rs(pids);
      app.messenger.off('resp-worker-pids', onResp);
    };
    app.messenger.on('resp-worker-pids', onResp);
    app.messenger.sendToAgent('req-worker-pids', {
      fromPid: process.pid,
    });
  });
}
