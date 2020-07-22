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

export const factory = () => PostModel;
providerWrapper([
  {
    id: 'postModel',
    provider: factory,
  },
]);

const scope = {
  available: {
    where: { display: true },
  },
};

@Scopes(scope)
@Table({
  tableName: 'news',
  freezeTableName: true,
  timestamps: false,
})
export class PostModel extends Model<PostModel> {
  @Column({
    field: 'news_id',
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
  postId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'news_title',
    type: DataType.STRING(200),
  })
  title: string;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'news_content',
    type: DataType.TEXT({ length: 'medium' }),
  })
  content: string;

  @AllowNull(false)
  @Column({
    field: 'add_user',
    type: DataType.INTEGER,
  })
  userId: number;

  @AllowNull(false)
  @Default(() => new Date())
  @Column({
    field: 'add_time',
    type: DataType.DATE,
  })
  createdAt: Date;

  @AllowNull(false)
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  display: number;

  // @Column({
  //   field: 'start_time',
  //   allowNull: true,
  //   type: DataType.DATE,
  // })
  // startTime: Date;

  // @Column({
  //   field: 'end_time',
  //   allowNull: true,
  //   type: DataType.DATE,
  // })
  // endTime: Date;
}

export type TPostModel = typeof PostModel;
export type CPostModel = PostModel;
export type TPostModelScopes = keyof typeof scope;
