import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  ForeignKey,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import UserModel from './user.model';
import { EUserMemberStatus } from '@/common/enums';

export const factory = () => UserMemberModel;
providerWrapper([
  {
    id: 'userMemberModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'user_member',
  freezeTableName: true,
  timestamps: true,
})
export default class UserMemberModel extends Model<UserMemberModel> {
  @Column({
    field: 'user_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  @ForeignKey(() => UserModel)
  userId: number;

  @Column({
    field: 'member_user_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  memberUserId: string;

  @AllowNull(false)
  @Default(EUserMemberStatus.pending)
  @Column({
    type: DataType.INTEGER,
  })
  status: EUserMemberStatus;

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

export type TUserMemberModel = typeof UserMemberModel;
export type CUserMemberModel = UserMemberModel;
