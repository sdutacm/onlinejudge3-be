import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => miscContract;
providerWrapper([
  {
    id: 'miscContract',
    provider: factory,
  },
]);

const miscContract = {
  uploadMediaReq: {
    properties: {
      // image: { type: 'image' },
    },
    additionalProperties: true,
  } as defContract.ContractSchema,

  uploadMediaResp: {
    properties: {
      url: { type: 'string' },
    },
    additionalProperties: false,
    required: ['url'],
  } as defContract.ContractSchema,

  uploadAssetReq: {
    properties: {
      prefix: { type: 'string' },
      // image: { type: 'image' },
    },
    additionalProperties: true,
  } as defContract.ContractSchema,

  uploadAssetResp: {
    properties: {
      url: { type: 'string' },
    },
    additionalProperties: false,
    required: ['url'],
  } as defContract.ContractSchema,

  getStaticObjectReq: {
    properties: {
      key: { type: 'string' },
    },
    additionalProperties: false,
    required: ['key'],
  } as defContract.ContractSchema,

  getStaticObjectResp: {
    properties: {
      key: { type: 'string' },
      category: { type: 'string' },
      mime: { type: 'string' },
      content: {},
      viewCount: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
    additionalProperties: false,
    required: ['key', 'category', 'mime', 'content', 'viewCount', 'createdAt', 'updatedAt'],
  } as defContract.ContractSchema,
};

export type IMiscContract = typeof miscContract;
export default miscContract;
