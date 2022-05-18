import { Model, Table, Column, DataType, Index, AllowNull, Default } from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { ICompetitionProblemModel } from '@/app/competition/competition.interface';

export const factory = () => CompetitionProblemModel;
providerWrapper([
  {
    id: 'competitionProblemModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'competition_problem',
  freezeTableName: true,
  timestamps: false,
})
export default class CompetitionProblemModel extends Model<CompetitionProblemModel>
  implements ICompetitionProblemModel {
  @Column({
    field: 'competition_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  competitionId: number;

  @Column({
    field: 'problem_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  problemId: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.TINYINT,
  })
  index: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'balloon_alias',
    type: DataType.STRING(16),
  })
  balloonAlias: string;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'balloon_color',
    type: DataType.STRING(32),
  })
  balloonColor: string;
}

export type TCompetitionProblemModel = typeof CompetitionProblemModel;
export type CCompetitionProblemModel = CompetitionProblemModel;
