import { provide } from 'midway';

@provide()
export default class ReplyMeta implements defMeta.BaseMeta {
  module = 'reply';
  pk = 'replyId';
}

export type CReplyMeta = ReplyMeta;
