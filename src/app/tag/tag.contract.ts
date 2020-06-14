import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => tagContract;
providerWrapper([
  {
    id: 'tagContract',
    provider: factory,
  },
]);

const tagContract = {
  getTagFullListReq: {
    properties: {
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getTagFullListResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
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
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  createTagReq: {
    properties: {
      nameEn: { type: 'string', maxLength: 32 },
      nameZhHans: { type: 'string', maxLength: 32 },
      nameZhHant: { type: 'string', maxLength: 32 },
      hidden: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['nameEn', 'nameZhHans', 'nameZhHant'],
  } as defContract.ContractSchema,

  createTagResp: {
    properties: {
      tagId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['tagId'],
  } as defContract.ContractSchema,

  updateTagDetailReq: {
    properties: {
      tagId: { type: 'number', minimum: 1 },
      nameEn: { type: 'string', maxLength: 32 },
      nameZhHans: { type: 'string', maxLength: 32 },
      nameZhHant: { type: 'string', maxLength: 32 },
      hidden: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['tagId', 'nameEn', 'nameZhHans', 'nameZhHant'],
  } as defContract.ContractSchema,
};

export type ITagContract = typeof tagContract;
export default tagContract;
