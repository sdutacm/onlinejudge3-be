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
          permissions: { type: 'array', items: { type: 'string' } },
          avatar: { type: ['string', 'null'] },
        },
        additionalProperties: false,
        required: ['userId', 'username', 'nickname', 'permission', 'permissions', 'avatar'],
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
      permissions: { type: 'array', items: { type: 'string' } },
      avatar: { type: ['string', 'null'] },
    },
    additionalProperties: false,
    required: ['userId', 'username', 'nickname', 'permission', 'permissions', 'avatar'],
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

  createUserReq: {
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 20, pattern: '^[0-9A-Za-z_]+$' },
      nickname: { type: 'string', minLength: 3, maxLength: 20 },
      email: { type: 'string', minLength: 5, maxLength: 60, format: 'email' },
      password: { type: 'string', minLength: 6, maxLength: 20, pattern: '^[!-~]+$' },
      school: { type: 'string', maxLength: 100 },
      college: { type: 'string', maxLength: 100 },
      major: { type: 'string', maxLength: 100 },
      class: { type: 'string', maxLength: 100 },
      grade: { type: 'string' },
    },
    additionalProperties: false,
    required: ['username', 'nickname', 'password'],
  } as defContract.ContractSchema,

  createUserResp: {
    properties: {
      userId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['userId'],
  } as defContract.ContractSchema,

  batchCreateUsersReq: {
    properties: {
      users: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 20, pattern: '^[0-9A-Za-z_]+$' },
            nickname: { type: 'string', minLength: 2, maxLength: 20 },
            password: { type: 'string', minLength: 6, maxLength: 20, pattern: '^[!-~]+$' },
            school: { type: 'string', maxLength: 100 },
            college: { type: 'string', maxLength: 100 },
            major: { type: 'string', maxLength: 100 },
            class: { type: 'string', maxLength: 100 },
            grade: { type: 'string' },
          },
          additionalProperties: false,
          required: ['username', 'nickname', 'password'],
        },
      },
      conflict: { type: 'string', enum: ['insert', 'upsert'] },
    },
    additionalProperties: false,
    required: ['users', 'conflict'],
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
      permission: { type: 'number' },
      verified: { type: 'boolean' },
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
            nickname: { type: 'string' },
            submitted: { type: 'number' },
            accepted: { type: 'number' },
            avatar: { type: ['string', 'null'] },
            bannerImage: { type: 'string' },
            rating: { type: 'number' },
            grade: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            forbidden: { type: 'number' },
            permission: { type: 'number' },
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
      nickname: { type: 'string' },
      username: { type: 'string' },
      email: { type: 'string' },
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
                competition: {
                  type: 'object',
                  properties: {
                    competitionId: { type: 'number' },
                    title: { type: 'string' },
                  },
                  additionalProperties: false,
                  required: ['competitionId', 'title'],
                },
                rank: { type: 'number' },
                rating: { type: 'number' },
                ratingChange: { type: 'number' },
                date: { type: 'string' },
              },
              additionalProperties: false,
              required: ['rank', 'rating', 'ratingChange', 'date'],
            },
          },
          { type: 'null' },
        ],
      },
      site: { type: 'string' },
      defaultLanguage: {
        anyOf: [{ type: 'string' }, { type: 'null' }],
      },
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
      nickname: { type: 'string', minLength: 3, maxLength: 20 },
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
      },
      forbidden: { type: 'number', enum: [0, 1, 2] },
      permission: { type: 'number', enum: [0, 1, 2, 3] },
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

  resetUserPasswordAndEmailReq: {
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 20, pattern: '^[0-9A-Za-z_]+$' },
      oldPassword: { type: 'string', minLength: 6, maxLength: 20, pattern: '^[!-~]+$' },
      email: { type: 'string', format: 'email' },
      code: { type: 'number' },
      password: { type: 'string', minLength: 6, maxLength: 20 },
    },
    additionalProperties: false,
    required: ['username', 'oldPassword', 'email', 'code', 'password'],
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
      competitionId: { type: 'number', minimum: 1 },
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

  getSessionListResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            isCurrent: { type: 'boolean' },
            loginUa: { type: 'string' },
            loginIp: { type: 'string' },
            loginAt: { type: 'string', format: 'date-time' },
            lastAccessIp: { type: 'string' },
            lastAccessAt: { type: 'string', format: 'date-time' },
          },
          additionalProperties: false,
          required: [
            'sessionId',
            'isCurrent',
            'loginUa',
            'loginIp',
            'loginAt',
            'lastAccessIp',
            'lastAccessAt',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  clearSessionReq: {
    properties: {
      sessionId: { type: 'string' },
    },
    additionalProperties: false,
    required: ['sessionId'],
  } as defContract.ContractSchema,

  getActiveUserCountResp: {
    properties: {
      count: { type: 'number' },
    },
    additionalProperties: false,
    required: ['count'],
  } as defContract.ContractSchema,

  getAllUserPermissionsMapResp: {
    properties: {
      count: { type: 'number' },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            userId: { type: 'number' },
            username: { type: 'string' },
            nickname: { type: 'string' },
            avatar: { type: ['string', 'null'] },
            permissions: { type: 'array', items: { type: 'string' } },
          },
          additionalProperties: false,
          required: ['userId', 'username', 'nickname', 'avatar', 'permissions'],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  setUserPermissionsReq: {
    properties: {
      userId: { type: 'number' },
      permissions: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    additionalProperties: false,
    required: ['userId', 'permissions'],
  } as defContract.ContractSchema,

  getSelfAchievedAchievementsResp: {
    properties: {
      count: { type: 'number' },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            achievementKey: { type: 'string' },
            status: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          additionalProperties: false,
          required: ['achievementKey', 'status', 'createdAt'],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  confirmAchievementDeliveriedReq: {
    properties: {
      achievementKey: { type: 'string' },
    },
    additionalProperties: false,
    required: ['achievementKey'],
  } as defContract.ContractSchema,

  receiveAchievementReq: {
    properties: {
      achievementKey: { type: 'string' },
    },
    additionalProperties: false,
    required: ['achievementKey'],
  } as defContract.ContractSchema,
};

export type IUserContract = typeof userContract;
export default userContract;
