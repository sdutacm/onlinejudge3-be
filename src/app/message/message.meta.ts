import { provide } from 'midway';

@provide()
export default class MessageMeta implements defMeta.BaseMeta {
  module = 'message';
  pk = 'messageId';
}

export type CMessageMeta = MessageMeta;
