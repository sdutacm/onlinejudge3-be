import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';
import judgerConfig from '../../config/judger.config';

export const factory = () => solutionContract;
providerWrapper([
  {
    id: 'solutionContract',
    provider: factory,
  },
]);

const solutionContract = {
  getSolutionListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['solutionId', 'time', 'memory'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      solutionId: { type: 'number', minimum: 1 },
      solutionIds: { type: 'array', items: { type: 'number', minimum: 1 } },
      problemId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
      contestId: { type: 'number', minimum: 1 },
      result: { type: 'number' },
      language: { type: 'string' },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getSolutionListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            solutionId: { type: 'number' },
            problem: {
              type: 'object',
              properties: {
                problemId: { type: 'number' },
                title: { type: 'string' },
                timeLimit: { type: 'number' },
              },
              additionalProperties: false,
              required: ['problemId', 'title', 'timeLimit'],
            },
            user: {
              type: 'object',
              properties: {
                userId: { type: 'number' },
                username: { type: 'string' },
                nickname: { type: 'string' },
                avatar: { type: ['string', 'null'] },
                bannerImage: { type: 'string' },
                rating: { type: 'number' },
              },
              additionalProperties: false,
              required: ['userId', 'username', 'nickname', 'avatar', 'bannerImage', 'rating'],
            },
            contest: {
              type: 'object',
              properties: {
                contestId: { type: 'number' },
                title: { type: 'string' },
                type: { type: 'number' },
              },
              additionalProperties: false,
              required: ['contestId', 'title', 'type'],
            },
            result: { type: 'number' },
            time: { type: 'number' },
            memory: { type: 'number' },
            language: { type: 'string' },
            codeLength: { type: 'number' },
            shared: { type: 'boolean' },
            isContestUser: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          additionalProperties: false,
          required: [
            'solutionId',
            'problem',
            'user',
            'result',
            'time',
            'memory',
            'language',
            'codeLength',
            'shared',
            'isContestUser',
            'createdAt',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,
};

export type ISolutionContract = typeof solutionContract;
export default solutionContract;
