import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  ForeignKey,
  AllowNull,
  Default,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { EContestUserStatus } from '@/common/enums';
import { IContestUserModel } from '@/app/contest/contest.interface';

export const factory = () => ContestUserModel;
providerWrapper([
  {
    id: 'contestUserModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'contest_user',
  freezeTableName: true,
  timestamps: false,
})
export default class ContestUserModel extends Model<ContestUserModel> implements IContestUserModel {
  @Column({
    field: 'id',
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
  contestUserId: number;

  @AllowNull(false)
  @Column({
    field: 'user_name',
    type: DataType.STRING(100),
  })
  username: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  password: string;

  @AllowNull(true)
  @Default('')
  @Column({
    field: 'schoolno1',
    type: DataType.STRING(30),
  })
  schoolNo1: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(50),
  })
  name1: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  school1: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  college1: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  major1: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  class1: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(30),
  })
  tel1: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  email1: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(36),
  })
  clothing1: string;

  @AllowNull(true)
  @Default('')
  @Column({
    field: 'schoolno2',
    type: DataType.STRING(30),
  })
  schoolNo2: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(50),
  })
  name2: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  school2: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  college2: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  major2: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  class2: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(30),
  })
  tel2: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  email2: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(36),
  })
  clothing2: string;

  @AllowNull(true)
  @Default('')
  @Column({
    field: 'schoolno3',
    type: DataType.STRING(30),
  })
  schoolNo3: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(50),
  })
  name3: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  school3: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  college3: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  major3: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  class3: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(30),
  })
  tel3: string;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  email3: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(36),
  })
  clothing3: string;

  @AllowNull(false)
  @Column({
    field: 'cid',
    type: DataType.INTEGER,
  })
  contestId: number;

  @AllowNull(true)
  @Default(() => new Date())
  @Column({
    field: 'registertime',
    type: DataType.DATE,
  })
  get createdAt(): IContestUserModel['createdAt'] {
    const value = this.getDataValue('createdAt');
    if (value instanceof Date && Number.isNaN(value.getTime())) {
      return null;
    }
    return value ?? null;
  }
  set createdAt(value: IContestUserModel['createdAt']) {
    this.setDataValue('createdAt', value);
  }

  @AllowNull(false)
  @Default(EContestUserStatus.wating)
  @Column({
    type: DataType.TINYINT,
  })
  status: number;

  @AllowNull(true)
  @Default('')
  @Column({
    type: DataType.STRING(100),
  })
  sitNo: string | null;

  // @AllowNull(true)
  // @Default('')
  // @Column({
  //   type: DataType.STRING,
  // })
  // refuse: string | null;

  @AllowNull(true)
  @Default('')
  @Column({
    field: 'nick_name',
    allowNull: true,
    type: DataType.STRING(200),
  })
  nickname: string;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  unofficial: boolean;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(64),
  })
  subname: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(256),
  })
  avatar: string;
}

export type TContestUserModel = typeof ContestUserModel;
export type CContestUserModel = ContestUserModel;
