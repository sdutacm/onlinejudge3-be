import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Default,
  AllowNull,
  HasOne,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { ESolutionResult } from '@/common/enums';
import { ISolutionModel } from '@/app/solution/solution.interface';
import JudgeInfoModel from './judgeInfo.model';

export const factory = () => SolutionModel;
providerWrapper([
  {
    id: 'solutionModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'solution',
  freezeTableName: true,
  timestamps: false,
})
export default class SolutionModel extends Model<SolutionModel> implements ISolutionModel {
  @Column({
    field: 'solution_id',
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
    name: 'solution_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'problem_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  solutionId: number;

  @AllowNull(false)
  @Column({
    field: 'problem_id',
    type: DataType.INTEGER,
  })
  @Index({
    name: 'solution_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'contest_id_2',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'problem_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'problem_result',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  problemId: number;

  @AllowNull(false)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
  })
  @Index({
    name: 'solution_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'problem_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'user_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  userId: number;

  @AllowNull(false)
  @Default(-1)
  @Column({
    field: 'contest_id',
    type: DataType.INTEGER,
  })
  @Index({
    name: 'solution_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'contest_id_2',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'problem_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'contest_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  contestId: number;

  @AllowNull(true)
  @Column({
    field: 'competition_id',
    type: DataType.INTEGER,
  })
  competitionId: number | null;

  @AllowNull(true)
  @Column({
    field: 'judge_info_id',
    type: DataType.INTEGER,
  })
  judgeInfoId: number | null;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'take_time',
    type: DataType.INTEGER,
  })
  time: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'take_memory',
    type: DataType.INTEGER,
  })
  memory: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'pro_lang',
    type: DataType.STRING(20),
  })
  language: string;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'code_length',
    type: DataType.INTEGER,
  })
  codeLength: number;

  @AllowNull(false)
  @Default(() => new Date())
  @Column({
    field: 'sub_time',
    type: DataType.DATE,
  })
  createdAt: Date;

  @AllowNull(false)
  @Default(ESolutionResult.WT)
  @Column({
    type: DataType.INTEGER,
  })
  @Index({
    name: 'result',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'contest_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'problem_result',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  result: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'user_name',
    type: DataType.STRING(50),
  })
  username: string;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'sub_ip',
    type: DataType.STRING(40),
  })
  @Index({
    name: 'solution_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  ip: string;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  finished: boolean;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  shared: boolean;

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'is_contest_user',
    type: DataType.BOOLEAN,
  })
  isContestUser: boolean;

  @HasOne(() => JudgeInfoModel, { foreignKey: 'judgeInfoId', sourceKey: 'judgeInfoId' })
  judgeInfo: JudgeInfoModel;
}

export type TSolutionModel = typeof SolutionModel;
export type CSolutionModel = SolutionModel;
