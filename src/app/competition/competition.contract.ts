import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => competitionContract;
providerWrapper([
  {
    id: 'competitionContract',
    provider: factory,
  },
]);

const competitionContract = {
  getCompetitionListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['competitionId'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      competitionId: { type: 'number', minimum: 1 },
      title: { type: 'string' },
      ended: { type: 'boolean' },
      isTeam: { type: 'boolean' },
      createdBy: { type: 'number' },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getCompetitionListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            competitionId: { type: 'number' },
            title: { type: 'string' },
            startAt: { type: 'string', format: 'date-time' },
            endAt: { type: 'string', format: 'date-time' },
            registerStartAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
            registerEndAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
            ended: { type: 'boolean' },
            isTeam: { type: 'boolean' },
            hidden: { type: 'boolean' },
            createdBy: { type: 'number' },
          },
          additionalProperties: false,
          required: [
            'competitionId',
            'title',
            'startAt',
            'endAt',
            'registerStartAt',
            'registerEndAt',
            'ended',
            'isTeam',
            'hidden',
            'createdBy',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,

  getCompetitionSessionReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getCompetitionSessionResp: {
    anyOf: [
      {
        type: 'object',
        properties: {
          userId: { type: 'number' },
          nickname: { type: 'string' },
          subname: { type: 'string' },
          role: { type: 'number' },
        },
        additionalProperties: false,
        required: ['userId', 'nickname', 'subname', 'role'],
      },
      {
        type: 'null',
      },
    ],
  } as defContract.ContractSchema,

  loginCompetitionReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
      password: { type: 'string' },
    },
    additionalProperties: false,
    required: ['competitionId', 'userId', 'password'],
  } as defContract.ContractSchema,

  loginCompetitionResp: {
    properties: {
      userId: { type: 'number' },
      nickname: { type: 'string' },
      subname: { type: 'string' },
      role: { type: 'number' },
    },
    additionalProperties: false,
    required: ['userId', 'nickname', 'subname', 'role'],
  } as defContract.ContractSchema,

  logoutCompetitionReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getCompetitionDetailReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getCompetitionDetailResp: {
    properties: {
      competitionId: { type: 'number' },
      title: { type: 'string' },
      introduction: { type: 'string' },
      startAt: { type: 'string', format: 'date-time' },
      endAt: { type: 'string', format: 'date-time' },
      registerStartAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      registerEndAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      ended: { type: 'boolean' },
      isTeam: { type: 'boolean' },
      hidden: { type: 'boolean' },
      createdBy: { type: 'number' },
    },
    additionalProperties: false,
    required: [
      'competitionId',
      'title',
      'introduction',
      'startAt',
      'endAt',
      'registerStartAt',
      'registerEndAt',
      'ended',
      'isTeam',
      'hidden',
      'createdBy',
    ],
  } as defContract.ContractSchema,

  createCompetitionReq: {
    properties: {
      title: { type: 'string' },
      introduction: { type: 'string' },
      startAt: { type: 'string', format: 'date-time' },
      endAt: { type: 'string', format: 'date-time' },
      registerStartAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      registerEndAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      isTeam: { type: 'boolean' },
      hidden: { type: 'boolean' },
    },
    additionalProperties: false,
    required: [
      'title',
      'introduction',
      'startAt',
      'endAt',
      'registerStartAt',
      'registerEndAt',
      'isTeam',
      'hidden',
    ],
  } as defContract.ContractSchema,

  createCompetitionResp: {
    properties: {
      competitionId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  updateCompetitionDetailReq: {
    properties: {
      competitionId: { type: 'number' },
      title: { type: 'string' },
      introduction: { type: 'string' },
      startAt: { type: 'string', format: 'date-time' },
      endAt: { type: 'string', format: 'date-time' },
      registerStartAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      registerEndAt: {
        anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
      },
      isTeam: { type: 'boolean' },
      hidden: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getCompetitionProblemsReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getCompetitionProblemsResp: {
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
            balloonAlias: { type: 'string' },
            balloonColor: { type: 'string' },
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

  getCompetitionProblemConfigReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getCompetitionProblemConfigResp: {
    properties: {
      count: { type: 'number' },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            problemId: { type: 'number', minimum: 1 },
            title: { type: 'string' },
            balloonAlias: { type: 'string' },
            balloonColor: { type: 'string' },
          },
          additionalProperties: false,
          required: ['problemId', 'title', 'balloonAlias', 'balloonColor'],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  setCompetitionProblemConfigReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
      problems: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            problemId: { type: 'number', minimum: 1 },
            balloonAlias: { type: 'string' },
            balloonColor: { type: 'string' },
          },
          additionalProperties: false,
          required: ['problemId', 'balloonAlias', 'balloonColor'],
        },
      },
    },
    additionalProperties: false,
    required: ['competitionId', 'problems'],
  } as defContract.ContractSchema,

  getCompetitionUsersReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
      role: { type: 'number' },
      status: { type: 'number' },
      banned: { type: 'boolean' },
      fieldShortName: { type: 'string' },
      seatNo: { type: 'number' },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getCompetitionUsersResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            competitionId: { type: 'number' },
            userId: { type: 'number' },
            role: { type: 'number' },
            status: { type: 'number' },
            fieldShortName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            seatNo: { anyOf: [{ type: 'number' }, { type: 'null' }] },
            banned: { type: 'boolean' },
            unofficialParticipation: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            info: {
              type: 'object',
              properties: {
                nickname: { type: 'string' },
                subname: { type: 'string' },
                realName: { type: 'string' },
                organization: { type: 'string' },
                company: { type: 'string' },
                studentNo: { type: 'string' },
                school: { type: 'string' },
                college: { type: 'string' },
                major: { type: 'string' },
                class: { type: 'string' },
                tel: { type: 'string' },
                qq: { type: 'string' },
                weChat: { type: 'string' },
                clothing: { type: 'string' },
                slogan: { type: 'string' },
                group: { type: 'string' },
              },
              additionalProperties: true,
              required: ['nickname'],
            },
          },
          additionalProperties: false,
          required: [
            'competitionId',
            'userId',
            'role',
            'status',
            'info',
            'fieldShortName',
            'seatNo',
            'banned',
            'unofficialParticipation',
            'createdAt',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  getCompetitionUserDetailReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId', 'userId'],
  } as defContract.ContractSchema,

  getCompetitionUserDetailResp: {
    properties: {
      competitionId: { type: 'number' },
      userId: { type: 'number' },
      role: { type: 'number' },
      status: { type: 'number' },
      password: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      fieldShortName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      seatNo: { anyOf: [{ type: 'number' }, { type: 'null' }] },
      banned: { type: 'boolean' },
      unofficialParticipation: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      info: {
        type: 'object',
        properties: {
          nickname: { type: 'string' },
          subname: { type: 'string' },
          realName: { type: 'string' },
          organization: { type: 'string' },
          company: { type: 'string' },
          studentNo: { type: 'string' },
          school: { type: 'string' },
          college: { type: 'string' },
          major: { type: 'string' },
          class: { type: 'string' },
          tel: { type: 'string' },
          qq: { type: 'string' },
          weChat: { type: 'string' },
          clothing: { type: 'string' },
          slogan: { type: 'string' },
          group: { type: 'string' },
        },
        additionalProperties: true,
        required: ['nickname'],
      },
    },
    additionalProperties: false,
    required: [
      'competitionId',
      'userId',
      'role',
      'status',
      'info',
      'fieldShortName',
      'seatNo',
      'banned',
      'unofficialParticipation',
      'createdAt',
    ],
  } as defContract.ContractSchema,

  getPublicCompetitionParticipantsReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getPublicCompetitionParticipantsResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            competitionId: { type: 'number' },
            userId: { type: 'number' },
            role: { type: 'number' },
            status: { type: 'number' },
            fieldShortName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            seatNo: { anyOf: [{ type: 'number' }, { type: 'null' }] },
            banned: { type: 'boolean' },
            unofficialParticipation: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            info: {
              type: 'object',
              properties: {
                nickname: { type: 'string' },
                subname: { type: 'string' },
                realName: { type: 'string' },
                organization: { type: 'string' },
                company: { type: 'string' },
                school: { type: 'string' },
                college: { type: 'string' },
                major: { type: 'string' },
                class: { type: 'string' },
                slogan: { type: 'string' },
                group: { type: 'string' },
              },
              additionalProperties: true,
              required: ['nickname'],
            },
          },
          additionalProperties: false,
          required: [
            'competitionId',
            'userId',
            'role',
            'status',
            'info',
            'fieldShortName',
            'seatNo',
            'banned',
            'unofficialParticipation',
            'createdAt',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  getPublicCompetitionParticipantDetailReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId', 'userId'],
  } as defContract.ContractSchema,

  getPublicCompetitionParticipantDetailResp: {
    properties: {
      competitionId: { type: 'number' },
      userId: { type: 'number' },
      role: { type: 'number' },
      status: { type: 'number' },
      fieldShortName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      seatNo: { anyOf: [{ type: 'number' }, { type: 'null' }] },
      banned: { type: 'boolean' },
      unofficialParticipation: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      info: {
        type: 'object',
        properties: {
          nickname: { type: 'string' },
          subname: { type: 'string' },
          realName: { type: 'string' },
          organization: { type: 'string' },
          company: { type: 'string' },
          school: { type: 'string' },
          college: { type: 'string' },
          major: { type: 'string' },
          class: { type: 'string' },
          slogan: { type: 'string' },
          group: { type: 'string' },
        },
        additionalProperties: true,
        required: ['nickname'],
      },
    },
    additionalProperties: false,
    required: [
      'competitionId',
      'userId',
      'role',
      'status',
      'info',
      'fieldShortName',
      'seatNo',
      'banned',
      'unofficialParticipation',
      'createdAt',
    ],
  } as defContract.ContractSchema,

  requestCompetitionParticipantPasswordReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId', 'userId'],
  } as defContract.ContractSchema,

  requestCompetitionParticipantPasswordResp: {
    properties: {
      password: { type: 'string' },
    },
    additionalProperties: false,
    required: ['password'],
  } as defContract.ContractSchema,

  getSignedUpCompetitionParticipantReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getSignedUpCompetitionParticipantResp: {
    anyOf: [
      {
        type: 'object',
        properties: {
          competitionId: { type: 'number' },
          userId: { type: 'number' },
          status: { type: 'number' },
          unofficialParticipation: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          info: {
            type: 'object',
            properties: {
              nickname: { type: 'string' },
              subname: { type: 'string' },
              realName: { type: 'string' },
              organization: { type: 'string' },
              company: { type: 'string' },
              studentNo: { type: 'string' },
              school: { type: 'string' },
              college: { type: 'string' },
              major: { type: 'string' },
              class: { type: 'string' },
              tel: { type: 'string' },
              qq: { type: 'string' },
              weChat: { type: 'string' },
              clothing: { type: 'string' },
              slogan: { type: 'string' },
              group: { type: 'string' },
            },
            additionalProperties: true,
            required: ['nickname'],
          },
        },
        additionalProperties: false,
        required: [
          'competitionId',
          'userId',
          'status',
          'info',
          'unofficialParticipation',
          'createdAt',
        ],
      },
      {
        type: 'null',
      },
    ],
  } as defContract.ContractSchema,

  signUpCompetitionParticipantReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
      unofficialParticipation: { type: 'boolean' },
      info: {
        type: 'object',
        properties: {
          nickname: { type: 'string', maxLength: 10 },
          subname: { type: 'string' },
          realName: { type: 'string' },
          organization: { type: 'string' },
          company: { type: 'string' },
          studentNo: { type: 'string' },
          school: { type: 'string' },
          college: { type: 'string' },
          major: { type: 'string' },
          class: { type: 'string' },
          tel: { type: 'string' },
          qq: { type: 'string' },
          weChat: { type: 'string' },
          clothing: { type: 'string' },
          slogan: { type: 'string' },
        },
        additionalProperties: false,
        required: ['nickname'],
      },
    },
    additionalProperties: false,
    required: ['competitionId', 'unofficialParticipation', 'info'],
  } as defContract.ContractSchema,

  modifySignedUpCompetitionParticipantReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
      unofficialParticipation: { type: 'boolean' },
      info: {
        type: 'object',
        properties: {
          nickname: { type: 'string', maxLength: 10 },
          subname: { type: 'string' },
          realName: { type: 'string' },
          organization: { type: 'string' },
          company: { type: 'string' },
          studentNo: { type: 'string' },
          school: { type: 'string' },
          college: { type: 'string' },
          major: { type: 'string' },
          class: { type: 'string' },
          tel: { type: 'string' },
          qq: { type: 'string' },
          weChat: { type: 'string' },
          clothing: { type: 'string' },
          slogan: { type: 'string' },
        },
        additionalProperties: false,
        required: ['nickname'],
      },
    },
    additionalProperties: false,
    required: ['competitionId', 'unofficialParticipation', 'info'],
  } as defContract.ContractSchema,

  auditCompetitionParticipantReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
      status: { type: 'number' },
      reason: { type: 'string' },
    },
    additionalProperties: false,
    required: ['competitionId', 'userId', 'status'],
  } as defContract.ContractSchema,

  confirmEnterCompetitionReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  confirmQuitCompetitionReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getCompetitionProblemSolutionStatsReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getCompetitionProblemSolutionStatsResp: {
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

  getCompetitionSettingsReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getCompetitionSettingsResp: {
    properties: {
      frozenLength: { type: 'number' },
      allowedAuthMethods: { type: 'array', items: { type: 'string' } },
      allowedSolutionLanguages: { type: 'array', items: { type: 'string' } },
    },
    additionalProperties: false,
    required: ['frozenLength', 'allowedAuthMethods', 'allowedSolutionLanguages'],
  } as defContract.ContractSchema,
};

export type ICompetitionContract = typeof competitionContract;
export default competitionContract;
