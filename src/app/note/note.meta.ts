import { provide } from 'midway';

@provide()
export default class NoteMeta implements defMeta.BaseMeta {
  module = 'note';
  pk = 'noteId';
}

export type CNoteMeta = NoteMeta;
