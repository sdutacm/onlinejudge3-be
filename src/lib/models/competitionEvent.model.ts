import { Model, Table, Column, DataType, Index, AllowNull, Default } from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { ICompetitionEventModel } from '@/app/competition/competition.interface';
import { ECompetitionEvent } from '@/app/competition/competition.enum';

export const factory = () => CompetitionEventModel;
providerWrapper([
  {
    id: 'competitionEventModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'competition_event',
  freezeTableName: true,
  timestamps: false,
})
export default class CompetitionEventModel extends Model<CompetitionEventModel>
  implements ICompetitionEventModel {
  @Column({
    field: 'competition_event_id',
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
  competitionEventId: number;

  @AllowNull(false)
  @Column({
    field: 'competition_id',
    type: DataType.INTEGER,
  })
  competitionId: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(64),
  })
  event: ECompetitionEvent;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'detail',
    type: DataType.TEXT,
  })
  get detail(): ICompetitionEventModel['detail'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('detail'));
    } catch (e) {
      // @ts-ignore
      return null;
    }
  }
  set detail(value: ICompetitionEventModel['detail']) {
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

  @AllowNull(true)
  @Column({
    field: 'judge_info_id',
    type: DataType.INTEGER,
  })
  judgeInfoId: number | null;

  @AllowNull(false)
  @Column({
    field: 'created_at',
    type: 'TIMESTAMP(6)',
  })
  createdAt: Date;
}

export type TCompetitionEventModel = typeof CompetitionEventModel;
export type CCompetitionEventModel = CompetitionEventModel;
