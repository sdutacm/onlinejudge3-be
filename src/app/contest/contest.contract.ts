import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => contestContract;
providerWrapper([
  {
    id: 'contestContract',
    provider: factory,
  },
]);

const contestContract = {
  getContestListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['contestId'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      contestId: { type: 'number', minimum: 1 },
      contestIds: { type: 'array', items: { type: 'number', minimum: 1 } },
      title: { type: 'string' },
      type: { type: 'number' },
      category: { type: 'number' },
      mode: { type: 'number' },
      hidden: { type: 'boolean' },
      joined: { type: 'boolean' },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getContestListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            contestId: { type: 'number' },
            title: { type: 'string' },
            type: { type: 'number' },
            category: { type: 'number' },
            mode: { type: 'number' },
            startAt: { type: 'string', format: 'date-time' },
            endAt: { type: 'string', format: 'date-time' },
            registerStartAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
            registerEndAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
            team: { type: 'boolean' },
            hidden: { type: 'boolean' },
          },
          additionalProperties: false,
          required: [
            'contestId',
            'title',
            'type',
            'category',
            'mode',
            'startAt',
            'endAt',
            'registerStartAt',
            'registerEndAt',
            'team',
            'hidden',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,

  getContestSessionReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  getContestSessionResp: {
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

  requestContestSessionReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
      username: { type: 'string' },
      password: { type: 'string' },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  requestContestSessionResp: {
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

  logoutContestReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  getContestDetailReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  getContestDetailResp: {
    properties: {
      contestId: { type: 'number' },
      title: { type: 'string' },
      type: { type: 'number' },
      category: { type: 'number' },
      mode: { type: 'number' },
      intro: { type: 'string' },
      description: { type: 'string' },
      password: { type: 'string' },
      startAt: { type: 'string', format: 'date-time' },
      endAt: { type: 'string', format: 'date-time' },
      frozenLength: { type: 'number' },
      registerStartAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      registerEndAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      team: { type: 'boolean' },
      ended: { type: 'boolean' },
      hidden: { type: 'boolean' },
    },
    additionalProperties: false,
    required: [
      'contestId',
      'title',
      'type',
      'category',
      'mode',
      'intro',
      'startAt',
      'endAt',
      'frozenLength',
      'registerStartAt',
      'registerEndAt',
      'team',
      'ended',
      'hidden',
    ],
  } as defContract.ContractSchema,

  createContestReq: {
    properties: {
      title: { type: 'string' },
      type: { type: 'number' },
      category: { type: 'number' },
      mode: { type: 'number' },
      intro: { type: 'string' },
      description: { type: 'string' },
      password: { type: 'string' },
      startAt: { type: 'string', format: 'date-time' },
      endAt: { type: 'string', format: 'date-time' },
      frozenLength: { type: 'number' },
      registerStartAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      registerEndAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      team: { type: 'boolean' },
      hidden: { type: 'boolean' },
    },
    additionalProperties: false,
    required: [
      'title',
      'type',
      'category',
      'mode',
      'description',
      'startAt',
      'endAt',
      'frozenLength',
      'registerStartAt',
      'registerEndAt',
      'team',
    ],
  } as defContract.ContractSchema,

  createContestResp: {
    properties: {
      contestId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  updateContestDetailReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
      title: { type: 'string' },
      type: { type: 'number' },
      category: { type: 'number' },
      mode: { type: 'number' },
      intro: { type: 'string' },
      description: { type: 'string' },
      password: { type: 'string' },
      startAt: { type: 'string', format: 'date-time' },
      endAt: { type: 'string', format: 'date-time' },
      frozenLength: { type: 'number' },
      registerStartAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      registerEndAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      team: { type: 'boolean' },
      hidden: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  getContestProblemsReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  getContestProblemsResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            problemId: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            input: { type: 'string' },
            output: { type: 'string' },
            samples: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  in: { type: 'string' },
                  out: { type: 'string' },
                },
                additionalProperties: false,
                required: ['in', 'out'],
              },
            },
            hint: { type: 'string' },
            source: { type: 'string' },
            authors: { type: 'array', items: { type: 'string' } },
            timeLimit: { type: 'number' },
            memoryLimit: { type: 'number' },
            difficulty: { type: 'number' },
            accepted: { type: 'number' },
            submitted: { type: 'number' },
            spj: { type: 'boolean' },
            display: { type: 'boolean' },
            spConfig: { type: 'object' },
            revision: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
          },
          additionalProperties: false,
          required: [
            'problemId',
            'title',
            'description',
            'input',
            'output',
            'samples',
            'hint',
            'source',
            'authors',
            'timeLimit',
            'memoryLimit',
            'difficulty',
            'accepted',
            'submitted',
            'spj',
            'display',
            'spConfig',
            'createdAt',
            'updatedAt',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  getContestProblemConfigReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  getContestProblemConfigResp: {
    properties: {
      count: { type: 'number' },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            problemId: { type: 'number', minimum: 1 },
            title: { type: 'string' },
            originalTitle: { type: 'string' },
          },
          additionalProperties: false,
          required: ['problemId', 'title'],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  setContestProblemConfigReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
      problems: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            problemId: { type: 'number', minimum: 1 },
            title: { type: 'string' },
          },
          additionalProperties: false,
          required: ['problemId', 'title'],
        },
      },
    },
    additionalProperties: false,
    required: ['contestId', 'problems'],
  } as defContract.ContractSchema,

  getContestUserListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['contestUserId'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      contestId: { type: 'number', minimum: 1 },
      contestUserId: { type: 'number', minimum: 1 },
      username: { type: 'string' },
      nickname: { type: 'string' },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  getContestUserListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            contestUserId: { type: 'number' },
            contestId: { type: 'number' },
            username: { type: 'string' },
            nickname: { type: 'string' },
            subname: { type: 'string' },
            avatar: { type: 'string' },
            status: { type: 'number' },
            unofficial: { type: 'boolean' },
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  school: { type: 'string' },
                  college: { type: 'string' },
                  major: { type: 'string' },
                  class: { type: 'string' },
                },
                additionalProperties: false,
                required: ['name', 'school', 'class'],
              },
            },
            createdAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
          },
          additionalProperties: false,
          required: [
            'contestUserId',
            'contestId',
            'username',
            'nickname',
            'subname',
            'avatar',
            'status',
            'unofficial',
            'members',
            'createdAt',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,

  getContestUsersReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
      status: { type: 'number', enum: [0, 1, 2, 3] },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  getContestUsersResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            contestUserId: { type: 'number' },
            contestId: { type: 'number' },
            username: { type: 'string' },
            nickname: { type: 'string' },
            subname: { type: 'string' },
            avatar: { type: 'string' },
            status: { type: 'number' },
            unofficial: { type: 'boolean' },
            password: { type: 'string' },
            sitNo: { type: 'string' },
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  schoolNo: { type: 'string' },
                  name: { type: 'string' },
                  school: { type: 'string' },
                  college: { type: 'string' },
                  major: { type: 'string' },
                  class: { type: 'string' },
                  tel: { type: 'string' },
                  email: { type: 'string' },
                  clothing: { type: 'string' },
                },
                additionalProperties: false,
                required: ['name', 'school', 'tel', 'email'],
              },
            },
            createdAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
            globalUserId: { type: 'number' },
            rating: { type: 'number' },
          },
          additionalProperties: false,
          required: [
            'contestUserId',
            'contestId',
            'username',
            'nickname',
            'subname',
            'avatar',
            'status',
            'unofficial',
            'password',
            'sitNo',
            'members',
            'createdAt',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  getContestUserDetailReq: {
    properties: {
      contestUserId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['contestUserId'],
  } as defContract.ContractSchema,

  getContestUserDetailResp: {
    properties: {
      contestUserId: { type: 'number' },
      contestId: { type: 'number' },
      username: { type: 'string' },
      nickname: { type: 'string' },
      subname: { type: 'string' },
      avatar: { type: 'string' },
      status: { type: 'number' },
      unofficial: { type: 'boolean' },
      password: { type: 'string' },
      sitNo: { type: 'string' },
      members: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            schoolNo: { type: 'string' },
            name: { type: 'string' },
            school: { type: 'string' },
            college: { type: 'string' },
            major: { type: 'string' },
            class: { type: 'string' },
            tel: { type: 'string' },
            email: { type: 'string' },
            clothing: { type: 'string' },
          },
          additionalProperties: false,
          required: ['name', 'school', 'tel', 'email'],
        },
      },
      createdAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      globalUserId: { type: 'number' },
      rating: { type: 'number' },
    },
    additionalProperties: false,
    required: [
      'contestUserId',
      'contestId',
      'username',
      'nickname',
      'subname',
      'avatar',
      'status',
      'unofficial',
      'password',
      'sitNo',
      'members',
      'createdAt',
    ],
  } as defContract.ContractSchema,

  createContestUserReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
      username: { type: 'string', maxLength: 64 },
      nickname: { type: 'string', maxLength: 64 },
      subname: { type: 'string', maxLength: 64 },
      status: { type: 'number' },
      unofficial: { type: 'boolean' },
      password: { type: 'string', maxLength: 32 },
      members: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            schoolNo: { type: 'string', maxLength: 32 },
            name: { type: 'string', maxLength: 32 },
            school: { type: 'string', maxLength: 64 },
            college: { type: 'string', maxLength: 64 },
            major: { type: 'string', maxLength: 64 },
            class: { type: 'string', maxLength: 64 },
            tel: { type: 'string', maxLength: 30 },
            email: { type: 'string', maxLength: 64 },
            clothing: { type: 'string', maxLength: 32 },
          },
          additionalProperties: false,
          required: ['name', 'school', 'tel', 'email'],
        },
        minItems: 1,
        maxItems: 3,
      },
    },
    additionalProperties: false,
    required: ['contestId', 'nickname', 'unofficial', 'password', 'members'],
  } as defContract.ContractSchema,

  batchCreateContestUsersReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
      users: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            username: { type: 'string', maxLength: 64 },
            nickname: { type: 'string', maxLength: 64 },
            subname: { type: 'string', maxLength: 64 },
            status: { type: 'number' },
            sitNo: { type: 'string' },
            unofficial: { type: 'boolean' },
            password: { type: 'string', maxLength: 32 },
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  schoolNo: { type: 'string', maxLength: 32 },
                  name: { type: 'string', maxLength: 32 },
                  school: { type: 'string', maxLength: 64 },
                  college: { type: 'string', maxLength: 64 },
                  major: { type: 'string', maxLength: 64 },
                  class: { type: 'string', maxLength: 64 },
                  tel: { type: 'string', maxLength: 30 },
                  email: { type: 'string', maxLength: 64 },
                  clothing: { type: 'string', maxLength: 32 },
                },
                additionalProperties: false,
                required: ['name', 'school', 'tel', 'email'],
              },
              minItems: 1,
              maxItems: 3,
            },
          },
          additionalProperties: false,
          required: ['username', 'nickname', 'unofficial', 'members'],
        },
      },
      conflict: { type: 'string', enum: ['insert', 'upsert'] },
    },
    additionalProperties: false,
    required: ['contestId', 'users', 'conflict'],
  } as defContract.ContractSchema,

  createContestUserResp: {
    properties: {
      contestUserId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['contestUserId'],
  } as defContract.ContractSchema,

  updateContestUserReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
      contestUserId: { type: 'number', minimum: 1 },
      nickname: { type: 'string', maxLength: 64 },
      subname: { type: 'string', maxLength: 64 },
      status: { type: 'number' },
      unofficial: { type: 'boolean' },
      password: { type: 'string', maxLength: 32 },
      members: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            schoolNo: { type: 'string', maxLength: 32 },
            name: { type: 'string', maxLength: 32 },
            school: { type: 'string', maxLength: 64 },
            college: { type: 'string', maxLength: 64 },
            major: { type: 'string', maxLength: 64 },
            class: { type: 'string', maxLength: 64 },
            tel: { type: 'string', maxLength: 30 },
            email: { type: 'string', maxLength: 64 },
            clothing: { type: 'string', maxLength: 32 },
          },
          additionalProperties: false,
          required: ['name', 'school', 'tel', 'email'],
        },
        minItems: 1,
        maxItems: 3,
      },
    },
    additionalProperties: false,
    required: ['contestId', 'contestUserId', 'nickname', 'unofficial', 'password', 'members'],
  } as defContract.ContractSchema,

  auditContestUserReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
      contestUserId: { type: 'number', minimum: 1 },
      status: { type: 'number' },
      reason: { type: 'string' },
    },
    additionalProperties: false,
    required: ['contestId', 'contestUserId', 'status'],
  } as defContract.ContractSchema,

  getContestProblemSolutionStatsReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  getContestProblemSolutionStatsResp: {
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        accepted: { type: 'number' },
        submitted: { type: 'number' },
      },
      additionalProperties: false,
      required: ['accepted', 'submitted'],
    },
  } as defContract.ContractSchema,

  getContestRanklistReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
      god: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  getContestRanklistResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            rank: { type: 'number' },
            user: {
              type: 'object',
              properties: {
                userId: { type: 'number' },
                username: { type: 'string' },
                nickname: { type: 'string' },
                avatar: { type: ['string', 'null'] },
                bannerImage: { type: 'string' },
                rating: { type: 'number' },
                globalUserId: { type: 'number' },
                oldRating: { type: 'number' },
                newRating: { type: 'number' },
              },
              additionalProperties: false,
              required: ['userId', 'username', 'nickname', 'avatar', 'bannerImage', 'rating'],
            },
            score: { type: 'number' },
            time: { type: 'number' },
            stats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  result: {
                    anyOf: [{ type: 'string', enum: ['FB', 'AC', 'RJ', '?'] }, { type: 'null' }],
                  },
                  tries: { type: 'number' },
                  time: { type: 'number' },
                },
                additionalProperties: false,
                required: ['result', 'tries', 'time'],
              },
            },
          },
          additionalProperties: false,
          required: ['rank', 'user', 'score', 'time', 'stats'],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  getContestRatingStatusReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,

  getContestRatingStatusResp: {
    anyOf: [
      {
        type: 'object',
        properties: {
          status: { type: 'number' },
          progress: { type: 'number' },
          used: { type: 'number' },
          totalUsed: { type: 'number' },
        },
        additionalProperties: false,
        required: ['status'],
      },
      { type: 'null' },
    ],
  } as defContract.ContractSchema,

  endContestReq: {
    properties: {
      contestId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['contestId'],
  } as defContract.ContractSchema,
};

export type IContestContract = typeof contestContract;
export default contestContract;
