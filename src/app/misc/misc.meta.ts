import { provide } from 'midway';

@provide()
export default class MiscMeta implements defMeta.BaseMeta {
  module = 'misc';
}

export type CMiscMeta = MiscMeta;
