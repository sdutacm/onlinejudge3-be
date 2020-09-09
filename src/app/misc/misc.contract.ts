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
};

export type IMiscContract = typeof miscContract;
export default miscContract;
