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
  getUserListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['userId', 'accepted', 'rating'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      userId: { type: 'number', minimum: 1 },
      username: { type: 'string' },
      nickname: { type: 'string' },
      school: { type: 'string' },
      college: { type: 'string' },
      major: { type: 'string' },
      class: { type: 'string' },
      grade: { type: 'string' },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,
  getUserDetailReq: {
    properties: {
      userId: { type: 'number', minimum: 1 },
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
