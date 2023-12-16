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
import { IRatingContestModel } from '@/app/contest/contest.interface';

export const factory = () => RatingContestModel;
providerWrapper([
  {
    id: 'ratingContestModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'rating_contest',
  freezeTableName: true,
  timestamps: false,
})
export default class RatingContestModel extends Model<RatingContestModel>
  implements IRatingContestModel {
  @Column({
    field: 'rating_contest_id',
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
  ratingContestId: number;

  @AllowNull(true)
  @Column({
    field: 'contest_id',
    type: DataType.INTEGER,
  })
  contestId: number | null;

  @AllowNull(true)
  @Column({
    field: 'competition_id',
    type: DataType.INTEGER,
  })
  competitionId: number | null;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'rating_until',
    type: DataType.TEXT({ length: 'long' }),
  })
  get ratingUntil(): IRatingContestModel['ratingUntil'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('ratingUntil'));
    } catch (e) {
      return {};
    }
  }
  set ratingUntil(value: IRatingContestModel['ratingUntil']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('ratingUntil', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('ratingUntil', '');
    }
  }

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'rating_change',
    type: DataType.TEXT({ length: 'medium' }),
  })
  get ratingChange(): IRatingContestModel['ratingChange'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('ratingChange'));
    } catch (e) {
      return {};
    }
  }
  set ratingChange(value: IRatingContestModel['ratingChange']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('ratingChange', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('ratingChange', '');
    }
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

export type TRatingContestModel = typeof RatingContestModel;
export type CRatingContestModel = RatingContestModel;
