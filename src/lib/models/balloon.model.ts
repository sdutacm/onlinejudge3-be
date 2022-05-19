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
import { IBalloonModel } from '@/app/balloon/balloon.interface';
import { EBalloonType, EBalloonStatus } from '@/common/enums';

export const factory = () => BalloonModel;
providerWrapper([
  {
    id: 'balloonModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'balloon',
  freezeTableName: true,
  timestamps: true,
})
export default class BalloonModel extends Model<BalloonModel> implements IBalloonModel {
  @Column({
    field: 'balloon_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  balloonId: number;

  @AllowNull(false)
  @Column({
    field: 'solution_id',
    type: DataType.INTEGER,
  })
  solutionId: number;

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
  @Column({
    field: 'problem_id',
    type: DataType.INTEGER,
  })
  problemId: number;

  @AllowNull(false)
  @Column({
    field: 'problem_index',
    type: DataType.TINYINT,
  })
  problemIndex: number;

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

  @AllowNull(false)
  @Column({
    type: DataType.STRING(64),
  })
  nickname: string;

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
  @Column({
    type: DataType.TINYINT,
  })
  type: EBalloonType;

  @AllowNull(false)
  @Column({
    type: DataType.TINYINT,
  })
  status: EBalloonStatus;

  @AllowNull(true)
  @Column({
    field: 'assigned_user_id',
    type: DataType.INTEGER,
  })
  assignedUserId: number | null;

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'is_fb',
    type: DataType.BOOLEAN,
  })
  isFb: boolean;

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

export type TBalloonModel = typeof BalloonModel;
export type CBalloonModel = BalloonModel;
