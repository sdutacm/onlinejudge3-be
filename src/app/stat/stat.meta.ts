import { provide } from 'midway';

@provide()
export default class StatMeta implements defMeta.BaseMeta {
  module = 'stat';
}

export type CStatMeta = StatMeta;
