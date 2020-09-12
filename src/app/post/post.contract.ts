import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => postContract;
providerWrapper([
  {
    id: 'postContract',
    provider: factory,
  },
]);

const postContract = {
  getPostListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['postId', 'createdAt'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      postId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
      title: { type: 'string' },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getPostListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            postId: { type: 'number' },
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
            createdAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
            display: { type: 'boolean' },
          },
          additionalProperties: false,
          required: ['postId', 'title', 'createdAt', 'display'],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,

  getPostDetailReq: {
    properties: {
      postId: { type: 'number', minimum: 1 },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
    required: ['postId'],
  } as defContract.ContractSchema,

  getPostDetailResp: {
    properties: {
      postId: { type: 'number' },
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
      content: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
      display: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['postId', 'title', 'content', 'createdAt', 'display'],
  } as defContract.ContractSchema,

  createPostReq: {
    properties: {
      title: { type: 'string', maxLength: 128 },
      content: { type: 'string' },
      display: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['title', 'content'],
  } as defContract.ContractSchema,

  createPostResp: {
    properties: {
      postId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['postId'],
  } as defContract.ContractSchema,

  updatePostDetailReq: {
    properties: {
      postId: { type: 'number', minimum: 1 },
      title: { type: 'string', maxLength: 128 },
      content: { type: 'string' },
      display: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['postId', 'title', 'content'],
  } as defContract.ContractSchema,
};

export type IPostContract = typeof postContract;
export default postContract;
