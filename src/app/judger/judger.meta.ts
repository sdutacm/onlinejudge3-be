import { provide } from 'midway';

@provide()
export default class JudgerMeta implements defMeta.BaseMeta {
  module = 'judger';
}

export type CJudgerMeta = JudgerMeta;
