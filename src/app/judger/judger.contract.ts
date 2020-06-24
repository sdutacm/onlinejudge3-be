import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => judgerContract;
providerWrapper([
  {
    id: 'judgerContract',
    provider: factory,
  },
]);

const judgerContract = {
  getJudgerDataFileReq: {
    properties: {
      path: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
    required: ['path'],
  } as defContract.ContractSchema,

  getJudgerDataFileResp: {
    anyOf: [
      {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['file', 'directory'] },
          filename: { type: 'string' },
          path: { type: 'string' },
          size: { type: 'number' },
          createTime: { type: 'string', format: 'date-time' },
          modifyTime: { type: 'string', format: 'date-time' },
          isBinary: { type: 'boolean' },
          content: {
            anyOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['Buffer'] },
                  data: { type: 'array', items: { type: 'number' } },
                },
                additionalProperties: false,
                required: ['type', 'data'],
              },
            ],
          },
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['file', 'directory', 'N/A'] },
                filename: { type: 'string' },
                path: { type: 'string' },
                size: { type: 'number' },
                createTime: { type: 'string', format: 'date-time' },
                modifyTime: { type: 'string', format: 'date-time' },
              },
              additionalProperties: false,
              required: ['type', 'filename', 'path', 'size', 'createTime', 'modifyTime'],
            },
          },
        },
        additionalProperties: false,
        required: ['type', 'filename', 'path', 'size', 'createTime', 'modifyTime'],
      },
      { type: 'null' },
    ],
  } as defContract.ContractSchema,

  getJudgerDataArchiveReq: {
    properties: {
      problemId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['problemId'],
  } as defContract.ContractSchema,

  uploadJudgerDataReq: {
    properties: {
      problemId: {
        anyOf: [
          { type: 'number', minimum: 1 },
          { type: 'string', minLength: 1 },
        ],
      },
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      commitMessage: { type: 'string', minLength: 1 },
      // data: { type: 'zip' },
    },
    additionalProperties: true,
    required: ['problemId', 'name', 'email', 'commitMessage'],
  } as defContract.ContractSchema,
};

export type IJudgerContract = typeof judgerContract;
export default judgerContract;
