import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => solutionContract;
providerWrapper([
  {
    id: 'solutionContract',
    provider: factory,
  },
]);

const solutionContract = {};

export type ISolutionContract = typeof solutionContract;
export default solutionContract;
