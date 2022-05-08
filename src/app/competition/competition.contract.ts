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
          role: { type: 'number' },
        },
        additionalProperties: false,
        required: ['userId', 'nickname', 'role'],
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
      role: { type: 'number' },
    },
    additionalProperties: false,
    required: ['userId', 'nickname', 'role'],
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
};

export type ICompetitionContract = typeof competitionContract;
export default competitionContract;
