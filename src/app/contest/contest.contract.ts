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
            sampleInput: { type: 'string' },
            sampleOutput: { type: 'string' },
            hint: { type: 'string' },
            source: { type: 'string' },
            author: { anyOf: [{ type: 'number' }, { type: 'null' }] },
            timeLimit: { type: 'number' },
            memoryLimit: { type: 'number' },
            difficulty: { type: 'number' },
            accepted: { type: 'number' },
            submitted: { type: 'number' },
            spj: { type: 'boolean' },
            display: { type: 'boolean' },
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
            'sampleInput',
            'sampleOutput',
            'hint',
            'source',
            'author',
            'timeLimit',
            'memoryLimit',
            'difficulty',
            'accepted',
            'submitted',
            'spj',
            'display',
            'createdAt',
            'updatedAt',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  setContestProblemsReq: {
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
                required: ['name', 'school', 'college', 'major', 'class'],
              },
            },
            createdAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
          },
          additionalProperties: false,
          required: [
            'contestUserId',
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
          required: [
            'schoolNo',
            'name',
            'school',
            'college',
            'major',
            'class',
            'tel',
            'email',
            'clothing',
          ],
        },
      },
      createdAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
    },
    additionalProperties: false,
    required: [
      'contestUserId',
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
          required: [
            'schoolNo',
            'name',
            'school',
            'college',
            'major',
            'class',
            'tel',
            'email',
            'clothing',
          ],
        },
        minItems: 1,
        maxItems: 3,
      },
    },
    additionalProperties: false,
    required: ['contestId', 'nickname', 'subname', 'unofficial', 'password', 'members'],
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
          required: [
            'schoolNo',
            'name',
            'school',
            'college',
            'major',
            'class',
            'tel',
            'email',
            'clothing',
          ],
        },
        minItems: 1,
        maxItems: 3,
      },
    },
    additionalProperties: false,
    required: [
      'contestId',
      'contestUserId',
      'nickname',
      'subname',
      'unofficial',
      'password',
      'members',
    ],
  } as defContract.ContractSchema,

  auditContestUserReq: {
    properties: {
      contestUserId: { type: 'number', minimum: 1 },
      status: { type: 'number' },
      reason: { type: 'string' },
    },
    additionalProperties: false,
    required: ['contestUserId', 'status'],
  } as defContract.ContractSchema,
};

export type IContestContract = typeof contestContract;
export default contestContract;
