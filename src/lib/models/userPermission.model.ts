import { Model, Table, Column, DataType, Index } from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { IUserPermissionModel } from '@/app/user/user.interface';
import { EPerm } from '@/common/configs/perm.config';

export const factory = () => UserPermissionModel;
providerWrapper([
  {
    id: 'userPermissionModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'user_permission',
  freezeTableName: true,
  timestamps: false,
})
export default class UserPermissionModel extends Model<UserPermissionModel>
  implements IUserPermissionModel {
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
  userId: number;

  @Column({
    primaryKey: true,
    type: DataType.STRING(128),
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  permission: EPerm;
}

export type TUserPermissionModel = typeof UserPermissionModel;
export type CUserPermissionModel = UserPermissionModel;
