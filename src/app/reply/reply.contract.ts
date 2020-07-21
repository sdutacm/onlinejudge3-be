import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => replyContract;
providerWrapper([
  {
    id: 'replyContract',
    provider: factory,
  },
]);

const replyContract = {
  getReplyListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['replyId', 'createdAt'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      replyId: { type: 'number', minimum: 1 },
      topicId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getReplyListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            replyId: { type: 'number' },
            topic: {
              type: 'object',
              properties: {
                topicId: { type: 'number' },
                title: { type: 'string' },
                replyCount: { type: 'number' },
              },
              additionalProperties: false,
              required: ['topicId', 'title', 'replyCount'],
            },
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
            content: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
            deleted: { type: 'boolean' },
          },
          additionalProperties: false,
          required: ['replyId', 'user', 'content', 'createdAt', 'deleted'],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,

  createReplyReq: {
    properties: {
      topicId: { type: 'number', minimum: 1 },
      content: { type: 'string' },
    },
    additionalProperties: false,
    required: ['topicId', 'content'],
  } as defContract.ContractSchema,

  createReplyResp: {
    properties: {
      replyId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['replyId'],
  } as defContract.ContractSchema,

  deleteReplyReq: {
    properties: {
      replyId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['replyId'],
  } as defContract.ContractSchema,
};

export type IReplyContract = typeof replyContract;
export default replyContract;
