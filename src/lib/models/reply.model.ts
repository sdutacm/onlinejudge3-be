import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Scopes,
  AllowNull,
  Default,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { IReplyModel } from '@/app/reply/reply.interface';

export const factory = () => ReplyModel;
providerWrapper([
  {
    id: 'replyModel',
    provider: factory,
  },
]);

const scope = {
  available: {
    where: { deleted: false },
  },
};

@Scopes(scope)
@Table({
  tableName: 'reply',
  freezeTableName: true,
  timestamps: false,
})
export default class ReplyModel extends Model<ReplyModel> implements IReplyModel {
  @Column({
    field: 'reply_id',
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  replyId: number;

  @AllowNull(false)
  @Column({
    field: 'reply_author',
    type: DataType.INTEGER,
  })
  userId: number;

  @AllowNull(false)
  @Default(() => new Date())
  @Column({
    field: 'reply_time',
    type: DataType.DATE,
  })
  createdAt: Date;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'reply_content',
    type: DataType.TEXT({ length: 'medium' }),
  })
  content: string;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'topic_id',
    type: DataType.INTEGER,
  })
  topicId: number;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  deleted: boolean;
}

export type TReplyModel = typeof ReplyModel;
export type CReplyModel = ReplyModel;
export type TReplyModelScopes = keyof typeof scope;
