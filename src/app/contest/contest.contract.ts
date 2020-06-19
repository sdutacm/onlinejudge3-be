import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => contestContract;
providerWrapper([
  {
    id: 'contestContract',
    provider: factory,
  },
]);

const contestContract = {
  getContestListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['contestId'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      contestId: { type: 'number', minimum: 1 },
      contestIds: { type: 'array', items: { type: 'number', minimum: 1 } },
      title: { type: 'string' },
      type: { type: 'number' },
      category: { type: 'number' },
      mode: { type: 'number' },
      hidden: { type: 'boolean' },
      joined: { type: 'boolean' },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getContestListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            contestId: { type: 'number' },
            title: { type: 'string' },
            type: { type: 'number' },
            category: { type: 'number' },
            mode: { type: 'number' },
            startAt: { type: 'string', format: 'date-time' },
            endAt: { type: 'string', format: 'date-time' },
            registerStartAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
            registerEndAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
            team: { type: 'boolean' },
            hidden: { type: 'boolean' },
          },
          additionalProperties: false,
          required: [
            'contestId',
            'title',
            'type',
            'category',
            'mode',
            'startAt',
            'endAt',
            'registerStartAt',
            'registerEndAt',
            'team',
            'hidden',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,
};

export type IContestContract = typeof contestContract;
export default contestContract;
