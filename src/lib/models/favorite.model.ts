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
import { IFavoriteModel } from '@/app/favorite/favorite.interface';

export const factory = () => FavoriteModel;
providerWrapper([
  {
    id: 'favoriteModel',
    provider: factory,
  },
]);

const scope = {
  available: {
    where: { deleted: false },
  },
};

@Scopes(scope)
@Table({
  tableName: 'favorite',
  freezeTableName: true,
  timestamps: true,
})
export default class FavoriteModel extends Model<FavoriteModel> implements IFavoriteModel {
  @Column({
    field: 'favorite_id',
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
  favoriteId: number;

  @AllowNull(false)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
  })
  userId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(64),
  })
  type: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT({ length: 'medium' }),
  })
  get target(): IFavoriteModel['target'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('target'));
    } catch (e) {
      return null;
    }
  }
  set target(value: IFavoriteModel['target']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('target', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('target', '');
    }
  }

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT({ length: 'medium' }),
  })
  note: string;

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
  deleted: boolean;
}

export type TFavoriteModel = typeof FavoriteModel;
export type CFavoriteModel = FavoriteModel;
export type TFavoriteModelScopes = keyof typeof scope;
