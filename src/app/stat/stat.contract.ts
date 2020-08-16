import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => statContract;
providerWrapper([
  {
    id: 'statContract',
    provider: factory,
  },
]);

const statContract = {
  getUserACRankReq: {
    properties: {
      type: { type: 'string', enum: ['day', 'week', 'month'] },
    },
    additionalProperties: false,
    required: ['type'],
  } as defContract.ContractSchema,

  getUserACRankResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                userId: { type: 'number' },
                username: { type: 'string' },
                nickname: { type: 'string' },
                avatar: { type: ['string', 'null'] },
                bannerImage: { type: 'string' },
              },
              additionalProperties: false,
              required: ['userId', 'username', 'nickname', 'avatar', 'bannerImage'],
            },
            accepted: { type: 'number' },
          },
          additionalProperties: false,
          required: ['user', 'accepted'],
        },
      },
      truncated: { type: 'number' },
      startAt: { type: 'string', description: 'YYYY-MM-DD HH:mm:ss' },
      _updateEvery: { type: 'number', description: 'ms' },
      _updatedAt: { type: 'number', description: 'timestamp ms' },
    },
    additionalProperties: false,
    required: ['count', 'rows', 'truncated', 'startAt', '_updateEvery', '_updatedAt'],
  } as defContract.ContractSchema,

  getUserAcceptedProblemsReq: {
    properties: {
      userIds: {
        type: 'array',
        items: {
          type: 'number',
          minimum: 1,
        },
      },
    },
    additionalProperties: false,
    required: ['userIds'],
  } as defContract.ContractSchema,

  getUserAcceptedProblemsResp: {
    properties: {
      stats: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            accepted: { type: 'number' },
            problems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pid: { type: 'number' },
                  sid: { type: 'number' },
                  at: { type: 'number', description: 'timestamp s' },
                },
                additionalProperties: false,
                required: ['pid', 'sid', 'at'],
              },
            },
            _updatedAt: { type: 'number', description: 'timestamp ms' },
          },
          additionalProperties: false,
          required: ['accepted', 'problems', '_updatedAt'],
        },
      },
      truncated: { type: 'number' },
      _updateEvery: { type: 'number', description: 'ms' },
      _updatedAt: { type: 'number', description: 'timestamp ms' },
    },
    additionalProperties: false,
    required: ['stats', 'truncated', '_updateEvery', '_updatedAt'],
  } as defContract.ContractSchema,

  getUserSubmittedProblemsReq: {
    properties: {
      userIds: {
        type: 'array',
        items: {
          type: 'number',
          minimum: 1,
        },
      },
    },
    additionalProperties: false,
    required: ['userIds'],
  } as defContract.ContractSchema,

  getUserSubmittedProblemsResp: {
    properties: {
      stats: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            accepted: { type: 'number' },
            submitted: { type: 'number' },
            problems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pid: { type: 'number' },
                  s: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        sid: { type: 'number' },
                        res: { type: 'number' },
                        at: { type: 'number', description: 'timestamp s' },
                      },
                      additionalProperties: false,
                      required: ['sid', 'res', 'at'],
                    },
                  },
                },
                additionalProperties: false,
                required: ['pid', 's'],
              },
            },
            _updatedAt: { type: 'number', description: 'timestamp ms' },
          },
          additionalProperties: false,
          required: ['accepted', 'submitted', 'problems', '_updatedAt'],
        },
      },
      truncated: { type: 'number' },
      _updateEvery: { type: 'number', description: 'ms' },
      _updatedAt: { type: 'number', description: 'timestamp ms' },
    },
    additionalProperties: false,
    required: ['stats', 'truncated', '_updateEvery', '_updatedAt'],
  } as defContract.ContractSchema,
};

export type IStatContract = typeof statContract;
export default statContract;
