import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => setContract;
providerWrapper([
  {
    id: 'setContract',
    provider: factory,
  },
]);

const setContract = {
  getSetListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['setId', 'createdAt'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      setId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
      title: { type: 'string' },
      type: { type: 'string' },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getSetListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            setId: { type: 'number' },
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
            title: { type: 'string' },
            type: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
            updatedAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
            hidden: { type: 'boolean' },
          },
          additionalProperties: false,
          required: ['setId', 'user', 'title', 'type', 'createdAt', 'updatedAt', 'hidden'],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,

  getSetDetailReq: {
    properties: {
      setId: { type: 'number', minimum: 1 },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
    required: ['setId'],
  } as defContract.ContractSchema,

  getSetDetailResp: {
    properties: {
      setId: { type: 'number' },
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
      title: { type: 'string' },
      description: { type: 'string' },
      type: { type: 'string' },
      props: {
        type: 'object',
        properties: {
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                problems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      problemId: { type: 'number' },
                      title: { type: 'string' },
                    },
                    additionalProperties: false,
                    required: ['problemId', 'title'],
                  },
                },
              },
              additionalProperties: false,
              required: ['title', 'problems'],
            },
          },
        },
        additionalProperties: false,
        required: ['sections'],
      },
      createdAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
      updatedAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
      hidden: { type: 'boolean' },
    },
    additionalProperties: false,
    required: [
      'setId',
      'user',
      'title',
      'description',
      'type',
      'props',
      'createdAt',
      'updatedAt',
      'hidden',
    ],
  } as defContract.ContractSchema,

  createSetReq: {
    properties: {
      title: { type: 'string', maxLength: 128 },
      description: { type: 'string', maxLength: 1024 },
      type: { type: 'string', enum: ['standard'] },
      props: {
        type: 'object',
        properties: {
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', maxLength: 32 },
                description: { type: 'string', maxLength: 1024 },
                problems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      problemId: { type: 'number', minimum: 1 },
                      title: { type: 'string', maxLength: 32 },
                    },
                    additionalProperties: false,
                    required: ['problemId'],
                  },
                },
              },
              additionalProperties: false,
              required: ['title', 'problems'],
            },
          },
        },
        additionalProperties: false,
        required: ['sections'],
      },
      hidden: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['title', 'description', 'type', 'props'],
  } as defContract.ContractSchema,

  createSetResp: {
    properties: {
      setId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['setId'],
  } as defContract.ContractSchema,

  updateSetReq: {
    properties: {
      setId: { type: 'number', minimum: 1 },
      title: { type: 'string', maxLength: 128 },
      description: { type: 'string', maxLength: 1024 },
      type: { type: 'string', enum: ['standard'] },
      props: {
        type: 'object',
        properties: {
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', maxLength: 32 },
                description: { type: 'string', maxLength: 1024 },
                problems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      problemId: { type: 'number', minimum: 1 },
                      title: { type: 'string', maxLength: 32 },
                    },
                    additionalProperties: false,
                    required: ['problemId'],
                  },
                },
              },
              additionalProperties: false,
              required: ['title', 'problems'],
            },
          },
        },
        additionalProperties: false,
        required: ['sections'],
      },
      hidden: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['setId', 'title', 'description', 'type', 'props'],
  } as defContract.ContractSchema,

  deleteSetReq: {
    properties: {
      setId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['setId'],
  } as defContract.ContractSchema,
};

export type ISetContract = typeof setContract;
export default setContract;
