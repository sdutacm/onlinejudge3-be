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

  loginReq: {
    properties: {
      loginName: { type: 'string' },
      password: { type: 'string' },
    },
    additionalProperties: false,
    required: ['loginName', 'password'],
  } as defContract.ContractSchema,

  loginResp: {
    properties: {
      userId: { type: 'number' },
      username: { type: 'string' },
      nickname: { type: 'string' },
      permission: { type: 'number' },
      avatar: { type: ['string', 'null'] },
    },
    additionalProperties: false,
    required: ['userId', 'username', 'nickname', 'permission', 'avatar'],
  } as defContract.ContractSchema,

  registerReq: {
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 20, pattern: '^[0-9A-Za-z_]+$' },
      nickname: { type: 'string', minLength: 3, maxLength: 20 },
      email: { type: 'string', minLength: 5, maxLength: 60, format: 'email' },
      code: { type: 'number' },
      password: { type: 'string', minLength: 6, maxLength: 20, pattern: '^[!-~]+$' },
    },
    additionalProperties: false,
    required: ['username', 'nickname', 'email', 'code', 'password'],
  } as defContract.ContractSchema,

  registerResp: {
    properties: {
      userId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['userId'],
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
      grade: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      forbidden: { type: 'number' },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
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
            grade: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            forbidden: { type: 'number' },
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
            'forbidden',
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
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
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
      grade: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      forbidden: { type: 'number' },
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
      site: { type: 'string' },
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
      lastIp: { type: 'string' },
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
      'forbidden',
      'rating',
      'ratingHistory',
      'site',
    ],
  } as defContract.ContractSchema,

  updateUserDetailReq: {
    properties: {
      userId: { type: 'number', minimum: 1 },
      school: { type: 'string', maxLength: 100 },
      college: { type: 'string', maxLength: 100 },
      major: { type: 'string', maxLength: 100 },
      class: { type: 'string', maxLength: 100 },
      site: {
        anyOf: [
          { type: 'string', maxLength: 255, format: 'url' },
          { type: 'string', maxLength: 0 },
        ],
      },
      defaultLanguage: {
        type: 'string',
        enum: ['', 'gcc', 'g++', 'java', 'python2', 'python3', 'c#'],
      },
      forbidden: { type: 'number', enum: [0, 1, 2] },
    },
    additionalProperties: false,
    required: ['userId'],
  } as defContract.ContractSchema,

  updateUserPasswordReq: {
    properties: {
      userId: { type: 'number', minimum: 1 },
      oldPassword: { type: 'string' },
      password: { type: 'string', minLength: 6, maxLength: 20, pattern: '^[!-~]+$' },
    },
    additionalProperties: false,
    required: ['userId', 'oldPassword', 'password'],
  } as defContract.ContractSchema,

  resetUserPasswordReq: {
    properties: {
      email: { type: 'string', format: 'email' },
      code: { type: 'number' },
      password: { type: 'string', minLength: 6, maxLength: 20, pattern: '^[!-~]+$' },
    },
    additionalProperties: false,
    required: ['email', 'code', 'password'],
  } as defContract.ContractSchema,

  resetUserPasswordByAdminReq: {
    properties: {
      userId: { type: 'number', minimum: 1 },
      password: { type: 'string', minLength: 6, maxLength: 20, pattern: '^[!-~]+$' },
    },
    additionalProperties: false,
    required: ['userId', 'password'],
  } as defContract.ContractSchema,

  updateUserEmailReq: {
    properties: {
      userId: { type: 'number', minimum: 1 },
      email: { type: 'string', format: 'email' },
      code: { type: 'number' },
    },
    additionalProperties: false,
    required: ['userId', 'email', 'code'],
  } as defContract.ContractSchema,

  uploadUserAvatarReq: {
    properties: {
      // avatar: { type: 'image' },
    },
    additionalProperties: true,
    required: [],
  } as defContract.ContractSchema,

  uploadUserBannerImageReq: {
    properties: {
      // bannerImage: { type: 'image' },
    },
    additionalProperties: true,
    required: [],
  } as defContract.ContractSchema,

  getUserProblemResultStatsReq: {
    properties: {
      userId: { type: 'number', minimum: 1 },
      contestId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['userId'],
  } as defContract.ContractSchema,

  getUserProblemResultStatsResp: {
    properties: {
      acceptedProblemIds: { type: 'array', items: { type: 'number' } },
      attemptedProblemIds: { type: 'array', items: { type: 'number' } },
    },
    additionalProperties: false,
    required: ['acceptedProblemIds', 'attemptedProblemIds'],
  } as defContract.ContractSchema,

  getUserSolutionCalendarReq: {
    properties: {
      userId: { type: 'number', minimum: 1 },
      result: { type: 'number' },
    },
    additionalProperties: false,
    required: ['userId', 'result'],
  } as defContract.ContractSchema,

  getUserSolutionCalendarResp: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', format: 'date' },
        count: { type: 'number' },
      },
      additionalProperties: false,
      required: ['date', 'count'],
    },
  } as defContract.ContractSchema,
};

export type IUserContract = typeof userContract;
export default userContract;
