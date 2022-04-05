import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  AllowNull,
  Default,
  Unique,
  CreatedAt,
  UpdatedAt,
  Scopes,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { IFieldModel } from '@/app/field/field.interface';

export const factory = () => FieldModel;
providerWrapper([
  {
    id: 'fieldModel',
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
  tableName: 'field',
  freezeTableName: true,
  timestamps: true,
})
export default class FieldModel extends Model<FieldModel> implements IFieldModel {
  @Column({
    field: 'field_id',
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
  fieldId: number;

  @AllowNull(false)
  @Unique(true)
  @Default('')
  @Column({
    type: DataType.STRING(64),
  })
  name: string;

  @AllowNull(false)
  @Unique(true)
  @Default('')
  @Column({
    field: 'short_name',
    type: DataType.STRING(16),
  })
  shortName: string;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'seating_arrangement',
    type: DataType.TEXT,
  })
  get seatingArrangement(): IFieldModel['seatingArrangement'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('seatingArrangement'));
    } catch (e) {
      return null;
    }
  }
  set seatingArrangement(value: IFieldModel['seatingArrangement']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('seatingArrangement', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('seatingArrangement', '');
    }
  }

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  deleted: boolean;

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

export type TFieldModel = typeof FieldModel;
export type CFieldModel = FieldModel;
export type TFieldModelScopes = keyof typeof scope;
