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
    additionalProperties: false,
    required: ['userId'],
  } as defContract.ContractSchema,
  loginReq: {
    properties: {
      loginName: { type: 'string' },
      password: { type: 'string' },
    },
    additionalProperties: false,
    required: ['loginName', 'password'],
  } as defContract.ContractSchema,
  registerReq: {
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 20, pattern: '^[0-9A-Za-z_]+$' },
      nickname: { type: 'string', minLength: 3, maxLength: 20 },
      email: { type: 'string', minLength: 5, maxLength: 60, format: 'email' },
      code: { type: 'number', minimum: 100000, maximum: 999999 },
      password: { type: 'string', minLength: 6, maxLength: 20, pattern: '^[!-~]+$' },
    },
    additionalProperties: false,
    required: ['username', 'nickname', 'email', 'code', 'password'],
  } as defContract.ContractSchema,
};

export type IUserContract = typeof userContract;
export default userContract;
