import { provide, inject, Context, config } from 'midway';
import { CMessageMeta } from './message.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TMessageModel } from '@/lib/models/message.model';
import {
  TMMessageLiteFields,
  TMMessageDetailFields,
  IMMessageDetail,
  IMMessageLite,
  IMessageModel,
} from './message.interface';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { CUserService } from '../user/user.service';

export type CMessageService = MessageService;

const messageLiteFields: Array<TMMessageLiteFields> = [
  'messageId',
  'fromUserId',
  'toUserId',
  'title',
  'content',
  'read',
  'anonymous',
  'createdAt',
];
const messageDetailFields: Array<TMMessageDetailFields> = [
  'messageId',
  'fromUserId',
  'toUserId',
  'title',
  'content',
  'read',
  'anonymous',
  'createdAt',
];

@provide()
export default class MessageService {
  @inject('messageMeta')
  meta: CMessageMeta;

  @inject('messageModel')
  model: TMessageModel;

  @inject()
  userService: CUserService;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @inject()
  lodash: ILodash;

  @config()
  redisKey: IRedisKeyConfig;

  @config('durations')
  durations: IDurationsConfig;
}
