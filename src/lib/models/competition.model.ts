import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Scopes,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { ICompetitionModel } from '@/app/competition/competition.interface';

export const factory = () => CompetitionModel;
providerWrapper([
  {
    id: 'competitionModel',
    provider: factory,
  },
]);

const scope = {
  available: {
    where: { hidden: false },
  },
};

@Scopes(scope)
@Table({
  tableName: 'competition',
  freezeTableName: true,
  timestamps: true,
})
export default class CompetitionModel extends Model<CompetitionModel> implements ICompetitionModel {
  @Column({
    field: 'competition_id',
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
  competitionId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(128),
  })
  title: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT({ length: 'long' }),
  })
  introduction: string;

  @AllowNull(false)
  @Column({
    field: 'start_at',
    type: DataType.DATE,
  })
  startAt: Date;

  @AllowNull(false)
  @Column({
    field: 'end_at',
    type: DataType.DATE,
  })
  endAt: Date;

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'ended',
    type: DataType.BOOLEAN,
  })
  ended: boolean;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(64),
  })
  rule: string;

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'is_team',
    type: DataType.BOOLEAN,
  })
  isTeam: boolean;

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'is_rating',
    type: DataType.BOOLEAN,
  })
  isRating: boolean;

  @AllowNull(true)
  @Default(null)
  @Column({
    field: 'register_start_at',
    type: DataType.DATE,
  })
  get registerStartAt(): ICompetitionModel['registerStartAt'] {
    const value = this.getDataValue('registerStartAt');
    if (value instanceof Date && Number.isNaN(value.getTime())) {
      return null;
    }
    return value ?? null;
  }
  set registerStartAt(value: ICompetitionModel['registerStartAt']) {
    this.setDataValue('registerStartAt', value);
  }

  @AllowNull(true)
  @Default(null)
  @Column({
    field: 'register_end_at',
    type: DataType.DATE,
  })
  get registerEndAt(): ICompetitionModel['registerEndAt'] {
    const value = this.getDataValue('registerEndAt');
    if (value instanceof Date && Number.isNaN(value.getTime())) {
      return null;
    }
    return value ?? null;
  }
  set registerEndAt(value: ICompetitionModel['registerEndAt']) {
    this.setDataValue('registerEndAt', value);
  }

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'created_by',
    type: DataType.INTEGER,
  })
  createdBy: number;

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'hidden',
    type: DataType.BOOLEAN,
  })
  hidden: boolean;

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'deleted',
    type: DataType.BOOLEAN,
  })
  deleted: boolean;

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

export type TCompetitionModel = typeof CompetitionModel;
export type CCompetitionModel = CompetitionModel;
export type TCompetitionModelScopes = keyof typeof scope;
