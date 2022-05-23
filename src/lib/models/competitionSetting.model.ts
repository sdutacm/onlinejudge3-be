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
import { ICompetitionSettingModel } from '@/app/competition/competition.interface';

export const factory = () => CompetitionSettingModel;
providerWrapper([
  {
    id: 'competitionSettingModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'competition_setting',
  freezeTableName: true,
  timestamps: true,
})
export default class CompetitionSettingModel extends Model<CompetitionSettingModel>
  implements ICompetitionSettingModel {
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

  @AllowNull(false)
  @Column({
    field: 'frozen_length',
    type: DataType.INTEGER,
  })
  frozenLength: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'allowed_auth_methods',
    type: DataType.STRING(256),
  })
  get allowedAuthMethods(): ICompetitionSettingModel['allowedAuthMethods'] {
    // @ts-ignore
    const value = (this.getDataValue('allowedAuthMethods') || '') as string;
    if (!value) {
      return [];
    }
    return value.split(',');
  }
  set allowedAuthMethods(value: ICompetitionSettingModel['allowedAuthMethods']) {
    // @ts-ignore
    this.setDataValue('allowedAuthMethods', (value || []).join(','));
  }

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'allowed_solution_languages',
    type: DataType.STRING(256),
  })
  get allowedSolutionLanguages(): ICompetitionSettingModel['allowedSolutionLanguages'] {
    // @ts-ignore
    const value = (this.getDataValue('allowedSolutionLanguages') || '') as string;
    if (!value) {
      return [];
    }
    return value.split(',');
  }
  set allowedSolutionLanguages(value: ICompetitionSettingModel['allowedSolutionLanguages']) {
    // @ts-ignore
    this.setDataValue('allowedSolutionLanguages', (value || []).join(','));
  }

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

export type TCompetitionSettingModel = typeof CompetitionSettingModel;
export type CCompetitionSettingModel = CompetitionSettingModel;
