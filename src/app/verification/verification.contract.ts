import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => verificationContract;
providerWrapper([
  {
    id: 'verificationContract',
    provider: factory,
  },
]);

const verificationContract = {
  sendEmailVerificationReq: {
    properties: {
      email: { type: 'string', format: 'email' },
    },
    additionalProperties: false,
    required: ['email'],
  } as defContract.ContractSchema,

  sendEmailVerificationResp: {
    properties: {
      retryAfter: { type: 'number' },
    },
    additionalProperties: false,
    required: ['retryAfter'],
  } as defContract.ContractSchema,
};

export type IVerificationContract = typeof verificationContract;
export default verificationContract;
