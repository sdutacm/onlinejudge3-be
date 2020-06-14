import { provide } from 'midway';

@provide()
export default class TagMeta implements defMeta.BaseMeta {
  module = 'tag';
  pk = 'tagId';
}

export type CTagMeta = TagMeta;
