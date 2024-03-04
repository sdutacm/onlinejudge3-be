import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => problemContract;
providerWrapper([
  {
    id: 'problemContract',
    provider: factory,
  },
]);

const problemContract = {
  getProblemListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['problemId'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      problemId: { type: 'number', minimum: 1 },
      problemIds: { type: 'array', items: { type: 'number', minimum: 1 } },
      title: { type: 'string' },
      source: { type: 'string' },
      authors: { type: 'array', items: { type: 'string' } },
      display: { type: 'boolean' },
      tagIds: { type: 'array', items: { type: 'number', minimum: 1 } },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getProblemListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            problemId: { type: 'number' },
            title: { type: 'string' },
            source: { type: 'string' },
            authors: { type: 'array', items: { type: 'string' } },
            difficulty: { type: 'number' },
            accepted: { type: 'number' },
            submitted: { type: 'number' },
            display: { type: 'boolean' },
            tags: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tagId: { type: 'number' },
                  nameEn: { type: 'string' },
                  nameZhHans: { type: 'string' },
                  nameZhHant: { type: 'string' },
                  hidden: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
                additionalProperties: false,
                required: ['tagId', 'nameEn', 'nameZhHans', 'nameZhHant', 'hidden', 'createdAt'],
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
          },
          additionalProperties: false,
          required: [
            'problemId',
            'title',
            'source',
            'authors',
            'difficulty',
            'accepted',
            'submitted',
            'display',
            'tags',
            'createdAt',
            'updatedAt',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,

  getProblemDetailReq: {
    properties: {
      problemId: { type: 'number', minimum: 1 },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
    required: ['problemId'],
  } as defContract.ContractSchema,

  getProblemDetailResp: {
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
      tags: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            tagId: { type: 'number' },
            nameEn: { type: 'string' },
            nameZhHans: { type: 'string' },
            nameZhHant: { type: 'string' },
            hidden: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          additionalProperties: false,
          required: ['tagId', 'nameEn', 'nameZhHans', 'nameZhHant', 'hidden', 'createdAt'],
        },
      },
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
      'revision',
      'tags',
      'createdAt',
      'updatedAt',
    ],
  } as defContract.ContractSchema,

  createProblemReq: {
    properties: {
      title: { type: 'string', maxLength: 50 },
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
      source: { type: 'string', maxLength: 200 },
      authors: { type: 'array', items: { type: 'string' } },
      timeLimit: { type: 'number', minimum: 1 },
      memoryLimit: { type: 'number', minimum: 1 },
      difficulty: { type: 'number', minimum: 1, maximum: 10 },
      spj: { type: 'boolean' },
      display: { type: 'boolean' },
      spConfig: { type: 'object' },
    },
    additionalProperties: false,
    required: [
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
    ],
  } as defContract.ContractSchema,

  createProblemResp: {
    properties: {
      problemId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['problemId'],
  } as defContract.ContractSchema,

  updateProblemDetailReq: {
    properties: {
      problemId: { type: 'number', minimum: 1 },
      title: { type: 'string', maxLength: 50 },
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
      source: { type: 'string', maxLength: 200 },
      authors: { type: 'array', items: { type: 'string' } },
      timeLimit: { type: 'number', minimum: 1 },
      memoryLimit: { type: 'number', minimum: 1 },
      difficulty: { type: 'number', minimum: 1, maximum: 10 },
      spj: { type: 'boolean' },
      display: { type: 'boolean' },
      spConfig: { type: 'object' },
    },
    additionalProperties: false,
    required: ['problemId'],
  } as defContract.ContractSchema,

  setProblemTagsReq: {
    properties: {
      problemId: { type: 'number', minimum: 1 },
      tagIds: { type: 'array', items: { type: 'number', minimum: 1 } },
    },
    additionalProperties: false,
    required: ['problemId', 'tagIds'],
  },
};

export type IProblemContract = typeof problemContract;
export default problemContract;
