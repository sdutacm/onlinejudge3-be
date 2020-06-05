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
  getSessionResp: {
    anyOf: [
      {
        type: 'object',
        properties: {
          userId: { type: 'number' },
          username: { type: 'string' },
          nickname: { type: 'string' },
          permission: { type: 'number' },
          avatar: { type: ['string', 'null'] },
        },
        additionalProperties: false,
        required: ['userId', 'username', 'nickname', 'permission', 'avatar'],
      },
      {
        type: 'null',
      },
    ],
  } as defContract.ContractSchema,

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

  getUserListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            userId: { type: 'number' },
            username: { type: 'string' },
            nickname: { type: 'string' },
            submitted: { type: 'number' },
            accepted: { type: 'number' },
            avatar: { type: ['string', 'null'] },
            bannerImage: { type: 'string' },
            rating: { type: 'number' },
            grade: { type: 'string' },
          },
          additionalProperties: false,
          required: [
            'userId',
            'username',
            'nickname',
            'submitted',
            'accepted',
            'avatar',
            'bannerImage',
            'rating',
            'grade',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,

  getUserDetailReq: {
    properties: {
      userId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['userId'],
  } as defContract.ContractSchema,

  getUserDetailResp: {
    properties: {
      userId: { type: 'number' },
      username: { type: 'string' },
      nickname: { type: 'string' },
      email: { type: 'string', format: 'email' },
      submitted: { type: 'number' },
      accepted: { type: 'number' },
      permission: { type: 'number' },
      avatar: { type: ['string', 'null'] },
      bannerImage: { type: 'string' },
      school: { type: 'string' },
      college: { type: 'string' },
      major: { type: 'string' },
      class: { type: 'string' },
      grade: { type: 'string' },
      rating: { type: 'number' },
      ratingHistory: {
        anyOf: [
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                contest: {
                  type: 'object',
                  properties: {
                    contestId: { type: 'number' },
                    title: { type: 'string' },
                  },
                  additionalProperties: false,
                  required: ['contestId', 'title'],
                },
                rank: { type: 'number' },
                rating: { type: 'number' },
                ratingChange: { type: 'number' },
                date: { type: 'string' },
              },
              additionalProperties: false,
              required: ['contest', 'rank', 'rating', 'ratingChange', 'date'],
            },
          },
          { type: 'null' },
        ],
      },
      defaultLanguage: { type: 'string' },
      settings: {
        anyOf: [
          {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
          { type: 'null' },
        ],
      },
      coin: { type: 'number' },
      verified: { type: 'boolean' },
      lastTime: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      createdAt: { type: 'string', format: 'date-time' },
    },
    additionalProperties: false,
    required: [
      'userId',
      'username',
      'nickname',
      'submitted',
      'accepted',
      'permission',
      'avatar',
      'bannerImage',
      'school',
      'college',
      'major',
      'class',
      'grade',
      'rating',
      'ratingHistory',
    ],
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

  uploadUserAvatarReq: {
    properties: {
      userId: { type: 'number', minimum: 1 },
      // avatar: { type: 'image' },
    },
    additionalProperties: true,
    required: ['userId'],
  } as defContract.ContractSchema,

  uploadUserBannerImageReq: {
    properties: {
      userId: { type: 'number', minimum: 1 },
      // bannerImage: { type: 'image' },
    },
    additionalProperties: true,
    required: ['userId'],
  } as defContract.ContractSchema,
};

export type IUserContract = typeof userContract;
export default userContract;
