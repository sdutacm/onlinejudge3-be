import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => noteContract;
providerWrapper([
  {
    id: 'noteContract',
    provider: factory,
  },
]);

const noteContract = {
  getNoteListReq: {
    properties: {
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['noteId'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      type: { type: 'string' },
      content: { type: 'string' },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getNoteListResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          anyOf: [
            {
              type: 'object',
              properties: {
                noteId: { type: 'number' },
                userId: { type: 'number' },
                type: { type: 'string', enum: ['problem'] },
                target: {
                  type: 'object',
                  properties: {
                    problemId: { type: 'number' },
                    title: { type: 'string' },
                    contest: {
                      type: 'object',
                      properties: {
                        contestId: { type: 'number' },
                        title: { type: 'string' },
                        problemIndex: { type: 'number' },
                      },
                      additionalProperties: false,
                      required: ['contestId', 'title', 'problemIndex'],
                    },
                  },
                  additionalProperties: false,
                  required: ['problemId', 'title'],
                },
                content: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deleted: { type: 'boolean' },
              },
              additionalProperties: false,
              required: [
                'noteId',
                'userId',
                'type',
                'target',
                'content',
                'createdAt',
                'updatedAt',
                'deleted',
              ],
            },
            {
              type: 'object',
              properties: {
                noteId: { type: 'number' },
                userId: { type: 'number' },
                type: { type: 'string', enum: ['contest'] },
                target: {
                  type: 'object',
                  properties: {
                    contestId: { type: 'number' },
                    title: { type: 'string' },
                  },
                  additionalProperties: false,
                  required: ['contestId', 'title'],
                },
                content: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deleted: { type: 'boolean' },
              },
              additionalProperties: false,
              required: [
                'noteId',
                'userId',
                'type',
                'target',
                'content',
                'createdAt',
                'updatedAt',
                'deleted',
              ],
            },
            {
              type: 'object',
              properties: {
                noteId: { type: 'number' },
                userId: { type: 'number' },
                type: { type: 'string', enum: ['solution'] },
                target: {
                  type: 'object',
                  properties: {
                    solutionId: { type: 'number' },
                    result: { type: 'number' },
                    problem: {
                      type: 'object',
                      properties: {
                        problemId: { type: 'number' },
                        title: { type: 'string' },
                      },
                      additionalProperties: false,
                      required: ['problemId', 'title'],
                    },
                    contest: {
                      type: 'object',
                      properties: {
                        contestId: { type: 'number' },
                        title: { type: 'string' },
                        problemIndex: { type: 'number' },
                      },
                      additionalProperties: false,
                      required: ['contestId', 'title', 'problemIndex'],
                    },
                  },
                  additionalProperties: false,
                  required: ['solutionId', 'result', 'problem'],
                },
                content: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deleted: { type: 'boolean' },
              },
              additionalProperties: false,
              required: [
                'noteId',
                'userId',
                'type',
                'target',
                'content',
                'createdAt',
                'updatedAt',
                'deleted',
              ],
            },
            {
              type: 'object',
              properties: {
                noteId: { type: 'number' },
                userId: { type: 'number' },
                type: { type: 'string', enum: [''] },
                target: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' },
                    location: {
                      type: 'object',
                      properties: {
                        pathname: { type: 'string' },
                        search: { type: 'string' },
                        query: {
                          type: 'object',
                          additionalProperties: {
                            type: 'string',
                          },
                        },
                        hash: { type: 'string' },
                      },
                      additionalProperties: false,
                      required: ['pathname', 'search', 'query', 'hash'],
                    },
                  },
                  additionalProperties: false,
                  required: ['url', 'location'],
                },
                content: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deleted: { type: 'boolean' },
              },
              additionalProperties: false,
              required: [
                'noteId',
                'userId',
                'type',
                'target',
                'content',
                'createdAt',
                'updatedAt',
                'deleted',
              ],
            },
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  addNoteReq: {
    anyOf: [
      {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['problem'] },
          target: {
            type: 'object',
            properties: {
              problemId: { type: 'number', minimum: 1 },
              contestId: { type: 'number', minimum: 1 },
            },
            additionalProperties: false,
            required: ['problemId'],
          },
          content: { type: 'string', maxLength: 10000 },
        },
        additionalProperties: false,
        required: ['type', 'target', 'content'],
      },
      {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['contest'] },
          target: {
            type: 'object',
            properties: {
              contestId: { type: 'number', minimum: 1 },
            },
            additionalProperties: false,
            required: ['contestId'],
          },
          content: { type: 'string', maxLength: 10000 },
        },
        additionalProperties: false,
        required: ['type', 'target', 'content'],
      },
      {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['solution'] },
          target: {
            type: 'object',
            properties: {
              solutionId: { type: 'number', minimum: 1 },
            },
            additionalProperties: false,
            required: ['solutionId'],
          },
          content: { type: 'string', maxLength: 10000 },
        },
        additionalProperties: false,
        required: ['type', 'target', 'content'],
      },
      {
        type: 'object',
        properties: {
          type: { type: 'string', enum: [''] },
          target: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              location: {
                type: 'object',
                properties: {
                  pathname: { type: 'string' },
                  search: { type: 'string' },
                  query: {
                    type: 'object',
                    additionalProperties: {
                      type: 'string',
                    },
                  },
                  hash: { type: 'string' },
                },
                additionalProperties: false,
                required: ['pathname', 'search', 'query', 'hash'],
              },
            },
            additionalProperties: false,
            required: ['url', 'location'],
          },
          content: { type: 'string', maxLength: 10000 },
        },
        additionalProperties: false,
        required: ['type', 'target', 'content'],
      },
    ],
  } as defContract.ContractSchema,

  addNoteResp: {
    properties: {
      noteId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['noteId'],
  } as defContract.ContractSchema,

  deleteNoteReq: {
    properties: {
      noteId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['noteId'],
  } as defContract.ContractSchema,
};

export type INoteContract = typeof noteContract;
export default noteContract;
