import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { ICompetitionQuestionModel } from '@/app/competition/competition.interface';

export const factory = () => CompetitionQuestionModel;
providerWrapper([
  {
    id: 'competitionQuestionModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'competition_question',
  freezeTableName: true,
  timestamps: true,
})
export default class CompetitionQuestionModel extends Model<CompetitionQuestionModel>
  implements ICompetitionQuestionModel {
  @Column({
    field: 'competition_question_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  competitionQuestionId: number;

  @AllowNull(false)
  @Column({
    field: 'competition_id',
    type: DataType.INTEGER,
  })
  competitionId: number;

  @AllowNull(false)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
  })
  userId: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.TINYINT,
  })
  status: number;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT,
  })
  content: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT,
  })
  reply: string;

  @AllowNull(true)
  @Column({
    field: 'replied_user_id',
    type: DataType.INTEGER,
  })
  repliedUserId: number;

  @AllowNull(true)
  @Column({
    field: 'replied_at',
    type: DataType.DATE,
  })
  repliedAt: Date;

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

export type TCompetitionQuestionModel = typeof CompetitionQuestionModel;
export type CCompetitionQuestionModel = CompetitionQuestionModel;
