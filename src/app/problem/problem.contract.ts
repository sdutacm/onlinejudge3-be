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
      author: { type: 'number' },
      tagIds: { type: 'array', items: { type: 'number', minimum: 1 } },
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
            author: { type: 'number' },
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
            'author',
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
      sampleInput: { type: 'string' },
      sampleOutput: { type: 'string' },
      hint: { type: 'string' },
      source: { type: 'string' },
      author: { type: 'number' },
      timeLimit: { type: 'number' },
      memoryLimit: { type: 'number' },
      difficulty: { type: 'number' },
      accepted: { type: 'number' },
      submitted: { type: 'number' },
      spj: { type: 'boolean' },
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
      'tags',
      'createdAt',
      'updatedAt',
    ],
  } as defContract.ContractSchema,
};

export type IProblemContract = typeof problemContract;
export default problemContract;
