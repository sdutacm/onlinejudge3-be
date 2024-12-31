import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  AllowNull,
  CreatedAt,
  Default,
  UpdatedAt,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';

export const factory = () => StaticObjectModel;
providerWrapper([
  {
    id: 'staticObjectModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'static_object',
  freezeTableName: true,
  timestamps: false,
})
export default class StaticObjectModel extends Model<StaticObjectModel> {
  @Column({
    primaryKey: true,
    type: DataType.STRING(64),
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  key: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(64),
  })
  category: string;

  @AllowNull(true)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
  })
  userId: number | null;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'mime',
    type: DataType.STRING(32),
  })
  mime: string;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'content',
    type: DataType.TEXT({ length: 'medium' }),
  })
  content: string;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'view_count',
    type: DataType.INTEGER,
  })
  viewCount: number;

  @AllowNull(false)
  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
  })
  createdAt: Date;

  @AllowNull(false)
  @UpdatedAt
  @Column({
    field: 'updated_at',
    type: DataType.DATE,
  })
  updatedAt: Date;
}

export type TStaticObjectModel = typeof StaticObjectModel;
export type CStaticObjectModel = StaticObjectModel;
