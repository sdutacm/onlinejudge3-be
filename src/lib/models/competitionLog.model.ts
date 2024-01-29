import { Model, Table, Column, DataType, Index, AllowNull, Default } from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { ICompetitionLogModel } from '@/app/competition/competition.interface';
import { ECompetitionLogAction } from '@/app/competition/competition.enum';

export const factory = () => CompetitionLogModel;
providerWrapper([
  {
    id: 'competitionLogModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'competition_log',
  freezeTableName: true,
  timestamps: false,
})
export default class CompetitionLogModel extends Model<CompetitionLogModel>
  implements ICompetitionLogModel {
  @Column({
    field: 'competition_log_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  competitionLogId: number;

  @AllowNull(false)
  @Column({
    field: 'competition_id',
    type: DataType.INTEGER,
  })
  competitionId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(64),
  })
  action: ECompetitionLogAction;

  @AllowNull(true)
  @Column({
    field: 'op_user_id',
    type: DataType.INTEGER,
  })
  opUserId: number | null;

  @AllowNull(true)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
  })
  userId: number | null;

  @AllowNull(true)
  @Column({
    field: 'problem_id',
    type: DataType.INTEGER,
  })
  problemId: number | null;

  @AllowNull(true)
  @Column({
    field: 'solution_id',
    type: DataType.INTEGER,
  })
  solutionId: number | null;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'detail',
    type: DataType.TEXT,
  })
  get detail(): ICompetitionLogModel['detail'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('detail'));
    } catch (e) {
      // @ts-ignore
      return null;
    }
  }
  set detail(value: ICompetitionLogModel['detail']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('detail', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('detail', '');
    }
  }

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(64),
  })
  ip: string;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'user_agent',
    type: DataType.STRING(128),
  })
  userAgent: string;

  @AllowNull(false)
  @Column({
    field: 'created_at',
    type: DataType.DATE,
  })
  createdAt: Date;
}

export type TCompetitionLogModel = typeof CompetitionLogModel;
export type CCompetitionLogModel = CompetitionLogModel;
