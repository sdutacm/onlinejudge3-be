import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => userContract;
providerWrapper([
  {
    id: 'userContract',
    provider: factory,
  },
]);

const userContract = {
  getUserDetailReq: {
    properties: {
      userId: { type: 'number', exclusiveMinimum: 0 },
    },
    required: ['userId'],
  } as defContract.ContractSchema,
};

export type IUserContract = typeof userContract;
