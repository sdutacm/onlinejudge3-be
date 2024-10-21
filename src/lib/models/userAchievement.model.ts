import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  AllowNull,
  CreatedAt,
  Default,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { EUserAchievementStatus } from '@/common/enums';
import { EAchievementKey } from '@/common/configs/achievement.config';

export const factory = () => UserAchievementModel;
providerWrapper([
  {
    id: 'userAchievementModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'user_achievement',
  freezeTableName: true,
  timestamps: false,
})
export default class UserAchievementModel extends Model<UserAchievementModel> {
  @Column({
    field: 'user_achievement_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  userAchievementId: number;

  @AllowNull(false)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
  })
  userId: number;

  @AllowNull(false)
  @Column({
    field: 'achievement_key',
    type: DataType.STRING(64),
  })
  achievementKey: EAchievementKey;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  status: EUserAchievementStatus;

  @AllowNull(true)
  // @CreatedAt // cannot use cuz missing `updated_at` column
  @Column({
    field: 'created_at',
    type: DataType.DATE,
  })
  createdAt: Date;
}

export type TUserAchievementModel = typeof UserAchievementModel;
export type CUserAchievementModel = UserAchievementModel;
