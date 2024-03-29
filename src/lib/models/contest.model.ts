import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Scopes,
  AllowNull,
  Default,
  BelongsToMany,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { EContestCategory, EContestMode } from '@/common/enums';
import { IContestModel } from '@/app/contest/contest.interface';
import UserModel from './user.model';
import UserContestModel from './userContest.model';

export const factory = () => ContestModel;
providerWrapper([
  {
    id: 'contestModel',
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
  tableName: 'contest',
  freezeTableName: true,
  timestamps: false,
})
export default class ContestModel extends Model<ContestModel> implements IContestModel {
  @Column({
    field: 'contest_id',
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
  contestId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'contest_name',
    type: DataType.STRING(100),
  })
  title: string;

  @AllowNull(false)
  @Column({
    field: 'start_time',
    type: DataType.DATE,
  })
  @Index({
    name: 'start_time',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  startAt: Date;

  @AllowNull(false)
  @Column({
    field: 'end_time',
    type: DataType.DATE,
  })
  @Index({
    name: 'end_time',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  endAt: Date;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT({ length: 'long' }),
  })
  description: string;

  @AllowNull(false)
  @Column({
    field: 'contest_type',
    type: DataType.TINYINT,
  })
  type: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'contest_author',
    type: DataType.INTEGER,
  })
  author: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'con_password',
    type: DataType.STRING(255),
  })
  password: string;

  @AllowNull(true)
  @Default(null)
  @Column({
    field: 'register_start',
    type: DataType.DATE,
  })
  get registerStartAt(): IContestModel['registerStartAt'] {
    const value = this.getDataValue('registerStartAt');
    if (value instanceof Date && Number.isNaN(value.getTime())) {
      return null;
    }
    return value ?? null;
  }
  set registerStartAt(value: IContestModel['registerStartAt']) {
    this.setDataValue('registerStartAt', value);
  }

  @AllowNull(true)
  @Default(null)
  @Column({
    field: 'register_end',
    type: DataType.DATE,
  })
  get registerEndAt(): IContestModel['registerEndAt'] {
    const value = this.getDataValue('registerEndAt');
    if (value instanceof Date && Number.isNaN(value.getTime())) {
      return null;
    }
    return value ?? null;
  }
  set registerEndAt(value: IContestModel['registerEndAt']) {
    this.setDataValue('registerEndAt', value);
  }

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'is_team',
    type: DataType.BOOLEAN,
  })
  team: boolean;

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'is_hiden',
    type: DataType.BOOLEAN,
  })
  hidden: boolean;

  @AllowNull(false)
  @Default(EContestCategory.contest)
  @Column({
    field: 'contest_category',
    type: DataType.INTEGER,
  })
  category: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'frozen_length',
    type: DataType.INTEGER,
  })
  frozenLength: number;

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'is_ended',
    type: DataType.BOOLEAN,
  })
  ended: boolean;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.TEXT({ length: 'long' }),
  })
  intro: string;

  @AllowNull(false)
  @Default(EContestMode.none)
  @Column({
    type: DataType.TINYINT,
  })
  mode: number;

  @BelongsToMany(() => UserModel, () => UserContestModel)
  users: Array<UserModel & { UserContestModel: UserContestModel }>;
}

export type TContestModel = typeof ContestModel;
export type CContestModel = ContestModel;
export type TContestModelScopes = keyof typeof scope;
