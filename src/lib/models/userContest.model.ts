import { Model, Table, Column, DataType, Index, ForeignKey } from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import UserModel from './user.model';
import ContestModel from './contest.model';

export const factory = () => UserContestModel;
providerWrapper([
  {
    id: 'userContestModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'user_contest',
  freezeTableName: true,
  timestamps: false,
})
export default class UserContestModel extends Model<UserContestModel> {
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
    field: 'contest_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  @ForeignKey(() => ContestModel)
  contestId: number;
}

export type TUserContestModel = typeof UserContestModel;
export type CUserContestModel = UserContestModel;
