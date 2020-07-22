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
import { ITopicModel } from '@/app/topic/topic.interface';

export const factory = () => TopicModel;
providerWrapper([
  {
    id: 'topicModel',
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
  tableName: 'topic',
  freezeTableName: true,
  timestamps: false,
})
export default class TopicModel extends Model<TopicModel> implements ITopicModel {
  @Column({
    field: 'topic_id',
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
  topicId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'topic_title',
    type: DataType.STRING(200),
  })
  title: string;

  @AllowNull(false)
  @Column({
    field: 'topic_author',
    type: DataType.INTEGER,
  })
  userId: number;

  @AllowNull(false)
  @Default(() => new Date())
  @Column({
    field: 'topic_time',
    type: DataType.DATE,
  })
  createdAt: Date;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'reply_num',
    type: DataType.INTEGER,
  })
  replyCount: number;

  @AllowNull(false)
  @Default(() => new Date())
  @Column({
    field: 'last_time',
    type: DataType.DATE,
  })
  lastTime: Date;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'last_user',
    type: DataType.INTEGER,
  })
  lastUserId: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'problem_id',
    type: DataType.INTEGER,
  })
  problemId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'topic_content',
    type: DataType.TEXT({ length: 'medium' }),
  })
  content: string;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  deleted: boolean;
}

export type TTopicModel = typeof TopicModel;
export type CTopicModel = TopicModel;
export type TTopicModelScopes = keyof typeof scope;
