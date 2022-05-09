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
import { ICompetitionUserModel } from '@/app/competition/competition.interface';

export const factory = () => CompetitionUserModel;
providerWrapper([
  {
    id: 'competitionUserModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'competition_user',
  freezeTableName: true,
  timestamps: true,
})
export default class CompetitionUserModel extends Model<CompetitionUserModel>
  implements ICompetitionUserModel {
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
  userId: number;

  @AllowNull(false)
  @Column({
    type: DataType.TINYINT,
  })
  role: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.TINYINT,
  })
  status: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'info',
    type: DataType.TEXT,
  })
  get info(): ICompetitionUserModel['info'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('info'));
    } catch (e) {
      // @ts-ignore
      return null;
    }
  }
  set info(value: ICompetitionUserModel['info']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('info', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('info', '');
    }
  }

  @AllowNull(true)
  @Column({
    type: DataType.STRING(64),
  })
  password: string;

  @AllowNull(true)
  @Column({
    field: 'field_short_name',
    type: DataType.STRING(16),
  })
  fieldShortName: string;

  @AllowNull(true)
  @Column({
    field: 'seat_no',
    type: DataType.INTEGER,
  })
  seatNo: number;

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'unofficial_participation',
    type: DataType.BOOLEAN,
  })
  unofficialParticipation: boolean;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  banned: boolean;

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

export type TCompetitionUserModel = typeof CompetitionUserModel;
export type CCompetitionUserModel = CompetitionUserModel;
