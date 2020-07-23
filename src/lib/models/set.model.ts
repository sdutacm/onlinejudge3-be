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
import { ISetModel } from '@/app/set/set.interface';

export const factory = () => SetModel;
providerWrapper([
  {
    id: 'setModel',
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
  tableName: 'set',
  freezeTableName: true,
  timestamps: false,
})
export default class SetModel extends Model<SetModel> implements ISetModel {
  @Column({
    field: 'set_id',
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
  setId: number;

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
  description: string;

  @Column({
    type: DataType.STRING(32),
  })
  type: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT({ length: 'long' }),
  })
  get props(): ISetModel['props'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('props'));
    } catch (e) {
      // @ts-ignore
      return null;
    }
  }
  set props(value: ISetModel['props']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('props', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('props', '');
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

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  hidden: boolean;

  @AllowNull(false)
  @Column({
    field: 'created_by',
    type: DataType.INTEGER,
  })
  userId: number;
}

export type TSetModel = typeof SetModel;
export type CSetModel = SetModel;
export type TSetModelScopes = keyof typeof scope;
