import { Model, Table, Column, DataType, Index, AllowNull, Default } from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { EGroupMemberPermission, EGroupMemberStatus } from '@/common/enums';

export const factory = () => GroupMemberModel;
providerWrapper([
  {
    id: 'groupMemberModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'group_member',
  freezeTableName: true,
  timestamps: false,
})
export default class GroupMemberModel extends Model<GroupMemberModel> {
  @Column({
    field: 'group_member_id',
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
  groupMemberId: number;

  @AllowNull(false)
  @Column({
    field: 'group_id',
    type: DataType.INTEGER,
  })
  groupId: number;

  @AllowNull(false)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
  })
  userId: number;

  @AllowNull(false)
  @Default(EGroupMemberPermission.user)
  @Column({
    type: DataType.TINYINT,
  })
  permission: number;

  @AllowNull(false)
  @Default(EGroupMemberStatus.normal)
  @Column({
    type: DataType.TINYINT,
  })
  status: number;

  @AllowNull(false)
  @Default(() => new Date())
  @Column({
    field: 'joined_at',
    type: DataType.DATE,
  })
  joinedAt: Date;
}

export type TGroupMemberModel = typeof GroupMemberModel;
export type CGroupMemberModel = GroupMemberModel;
