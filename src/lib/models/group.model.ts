import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Scopes,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { EGroupJoinChannel } from '@/common/enums';

export const factory = () => GroupModel;
providerWrapper([
  {
    id: 'groupModel',
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
  tableName: 'group',
  freezeTableName: true,
  timestamps: true,
})
export default class GroupModel extends Model<GroupModel> {
  @Column({
    field: 'group_id',
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
  groupId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(64),
  })
  name: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(64),
  })
  avatar: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT,
  })
  intro: string;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  verified: boolean;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  private: boolean;

  @AllowNull(false)
  @Default(EGroupJoinChannel.any)
  @Column({
    field: 'join_channel',
    type: DataType.TINYINT,
  })
  joinChannel: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'members_count',
    type: DataType.INTEGER,
  })
  membersCount: number;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  deleted: boolean;

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

export type TGroupModel = typeof GroupModel;
export type CGroupModel = GroupModel;
export type TGroupModelScopes = keyof typeof scope;
