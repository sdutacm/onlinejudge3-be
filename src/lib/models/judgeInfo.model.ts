import { Model, Table, Column, DataType, Index, AllowNull, Default } from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { IJudgeInfoModel } from '@/app/solution/solution.interface';

export const factory = () => JudgeInfoModel;
providerWrapper([
  {
    id: 'judgeInfoModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'judge_info',
  freezeTableName: true,
  timestamps: false,
})
export default class JudgeInfoModel extends Model<JudgeInfoModel> implements IJudgeInfoModel {
  @Column({
    field: 'id',
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
    name: 'id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  judgeInfoId: number;

  @AllowNull(false)
  @Column({
    field: 'solution_id',
    type: DataType.INTEGER,
  })
  @Index({
    name: 'solution_id',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  solutionId: number;

  @AllowNull(true)
  @Column({
    field: 'problem_revision',
    type: DataType.INTEGER,
  })
  problemRevision: number | null;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  result: number;

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
  @Default(0)
  @Column({
    field: 'last_case',
    type: DataType.INTEGER,
  })
  lastCase: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'total_case',
    type: DataType.INTEGER,
  })
  totalCase: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'detail',
    type: DataType.TEXT,
  })
  get detail(): IJudgeInfoModel['detail'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('detail'));
    } catch (e) {
      return null;
    }
  }
  set detail(value: IJudgeInfoModel['detail']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('detail', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('detail', '');
    }
  }

  @AllowNull(true)
  @Column({
    field: 'created_at',
    type: DataType.DATE,
  })
  createdAt: Date;

  @AllowNull(true)
  @Column({
    field: 'finished_at',
    type: DataType.DATE,
  })
  finishedAt: Date | null;
}

export type TJudgeInfoModel = typeof JudgeInfoModel;
export type CJudgeInfoModel = JudgeInfoModel;
