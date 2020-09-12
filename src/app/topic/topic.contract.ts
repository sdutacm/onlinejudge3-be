import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => topicContract;
providerWrapper([
  {
    id: 'topicContract',
    provider: factory,
  },
]);

const topicContract = {
  getTopicListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['topicId', 'createdAt'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      topicId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
      problemId: { type: 'number', minimum: 1 },
      title: { type: 'string' },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getTopicListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            topicId: { type: 'number' },
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
            problem: {
              type: 'object',
              properties: {
                problemId: { type: 'number' },
                title: { type: 'string' },
              },
              additionalProperties: false,
              required: ['problemId', 'title'],
            },
            title: { type: 'string' },
            replyCount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
            deleted: { type: 'boolean' },
          },
          additionalProperties: false,
          required: ['topicId', 'user', 'title', 'replyCount', 'createdAt', 'deleted'],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,

  getTopicDetailReq: {
    properties: {
      topicId: { type: 'number', minimum: 1 },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
    required: ['topicId'],
  } as defContract.ContractSchema,

  getTopicDetailResp: {
    properties: {
      topicId: { type: 'number' },
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
      problem: {
        type: 'object',
        properties: {
          problemId: { type: 'number' },
          title: { type: 'string' },
        },
        additionalProperties: false,
        required: ['problemId', 'title'],
      },
      title: { type: 'string' },
      content: { type: 'string' },
      replyCount: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
      deleted: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['topicId', 'user', 'title', 'content', 'replyCount', 'createdAt', 'deleted'],
  } as defContract.ContractSchema,

  createTopicReq: {
    properties: {
      title: { type: 'string', maxLength: 128 },
      content: { type: 'string' },
      problemId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['title', 'content'],
  } as defContract.ContractSchema,

  createTopicResp: {
    properties: {
      topicId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['topicId'],
  } as defContract.ContractSchema,

  updateTopicDetailReq: {
    properties: {
      topicId: { type: 'number', minimum: 1 },
      title: { type: 'string', maxLength: 128 },
      content: { type: 'string' },
    },
    additionalProperties: false,
    required: ['topicId', 'title', 'content'],
  } as defContract.ContractSchema,

  deleteTopicReq: {
    properties: {
      topicId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['topicId'],
  } as defContract.ContractSchema,
};

export type ITopicContract = typeof topicContract;
export default topicContract;
