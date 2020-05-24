import { provide } from 'midway';

@provide()
export default class VerificationMeta implements defMeta.BaseMeta {
  module = 'verification';
}

export type CVerificationMeta = VerificationMeta;
