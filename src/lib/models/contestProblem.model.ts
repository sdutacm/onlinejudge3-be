import { Model, Table, Column, DataType, Index, AllowNull, Default } from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { IContestProblemModel } from '@/app/contest/contest.interface';

export const factory = () => ContestProblemModel;
providerWrapper([
  {
    id: 'contestProblemModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'contest_pro',
  freezeTableName: true,
  timestamps: false,
})
export default class ContestProblemModel extends Model<ContestProblemModel>
  implements IContestProblemModel {
  @Column({
    field: 'con_pro_id',
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
  @Index({
    name: 'con_pro_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  contestProblemId: number;

  @Column({
    field: 'contest_id',
    type: DataType.INTEGER,
  })
  @Index({
    name: 'contest_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  contestId: number;

  @Column({
    field: 'problem_id',
    type: DataType.INTEGER,
  })
  @Index({
    name: 'problem_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  problemId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'problem_name',
    type: DataType.STRING(160),
  })
  title: string;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'pro_order',
    type: DataType.TINYINT,
  })
  index: number;
}

export type TContestProblemModel = typeof ContestProblemModel;
export type CContestProblemModel = ContestProblemModel;
