import { providerWrapper } from 'midway';
import PromiseQueue from 'promise-queue';

export const factory = () => PromiseQueue;
providerWrapper([
  {
    id: 'PromiseQueue',
    provider: factory,
  },
]);

export default PromiseQueue;
export type CPromiseQueue = typeof PromiseQueue;
