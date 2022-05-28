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
import { ICompetitionNotificationModel } from '@/app/competition/competition.interface';

export const factory = () => CompetitionNotificationModel;
providerWrapper([
  {
    id: 'competitionNotificationModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'competition_notification',
  freezeTableName: true,
  timestamps: true,
})
export default class CompetitionNotificationModel extends Model<CompetitionNotificationModel>
  implements ICompetitionNotificationModel {
  @Column({
    field: 'competition_notification_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  competitionNotificationId: number;

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
  @Default('')
  @Column({
    type: DataType.TEXT,
  })
  content: string;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  deleted: string;

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

export type TCompetitionNotificationModel = typeof CompetitionNotificationModel;
export type CCompetitionNotificationModel = CompetitionNotificationModel;
