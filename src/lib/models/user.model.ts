import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Scopes,
  AllowNull,
  Default,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { EUserPermission, EUserForbidden } from '@/common/enums';
import { IUserModel } from '@/app/user/user.interface';

export const factory = () => UserModel;
providerWrapper([
  {
    id: 'userModel',
    provider: factory,
  },
]);

const scope = {
  available: {
    where: { forbidden: EUserForbidden.normal },
  },
};

@Scopes(scope)
@Table({
  tableName: 'user',
  freezeTableName: true,
  timestamps: false,
})
export default class UserModel extends Model<UserModel> implements IUserModel {
  @Column({
    field: 'user_id',
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
  @Index({
    name: 'user_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  userId: number;

  @Column({
    field: 'user_name',
    primaryKey: true,
    type: DataType.STRING(50),
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  username: string;

  @AllowNull(false)
  @Column({
    field: 'nick_name',
    type: DataType.STRING(50),
  })
  nickname: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(60),
  })
  email: string;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  verified: boolean;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(120),
  })
  password: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(120),
  })
  school: string;

  @AllowNull(false)
  @Default(() => new Date())
  @Column({
    field: 'reg_time',
    type: DataType.DATE,
  })
  createdAt: Date;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'submit',
    type: DataType.INTEGER,
  })
  submitted: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'accept',
    type: DataType.INTEGER,
  })
  accepted: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'pro_lang',
    type: DataType.STRING(20),
  })
  defaultLanguage: string;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'last_ip',
    type: DataType.STRING(20),
  })
  lastIp: string;

  @AllowNull(true)
  @Column({
    field: 'last_time',
    type: DataType.DATE,
  })
  lastTime: Date | null;

  @AllowNull(false)
  @Default(EUserPermission.normal)
  @Column({
    field: 'level',
    type: DataType.TINYINT,
  })
  permission: number;

  @AllowNull(false)
  @Default(EUserForbidden.normal)
  @Column({
    type: DataType.TINYINT,
  })
  forbidden: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'image',
    type: DataType.STRING(120),
  })
  avatar: string | null;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(400),
  })
  college: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(400),
  })
  major: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(200),
  })
  grade: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(200),
  })
  class: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(255),
  })
  site: string;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'banner_image',
    type: DataType.STRING(256),
  })
  bannerImage: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT({ length: 'medium' }),
  })
  settings: string;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  coin: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  rating: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'rating_history',
    type: DataType.TEXT({ length: 'long' }),
  })
  get ratingHistory(): IUserModel['ratingHistory'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('ratingHistory'));
    } catch (e) {
      return null;
    }
  }
  set ratingHistory(value: IUserModel['ratingHistory']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('ratingHistory', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('ratingHistory', '');
    }
  }
}

export type TUserModel = typeof UserModel;
export type CUserModel = UserModel;
export type TUserModelScopes = keyof typeof scope;
