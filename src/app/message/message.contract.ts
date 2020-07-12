import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => messageContract;
providerWrapper([
  {
    id: 'messageContract',
    provider: factory,
  },
]);

const messageContract = {
  getMessageListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['messageId'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      messageId: { type: 'number', minimum: 1 },
      fromUserId: { type: 'number', minimum: 1 },
      toUserId: { type: 'number', minimum: 1 },
      read: { type: 'boolean' },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getMessageListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            messageId: { type: 'number' },
            from: {
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
            to: {
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
            content: { type: 'string' },
            read: { type: 'boolean' },
            anonymous: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          additionalProperties: false,
          required: ['messageId', 'to', 'title', 'content', 'anonymous', 'createdAt'],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,
};

export type IMessageContract = typeof messageContract;
export default messageContract;
