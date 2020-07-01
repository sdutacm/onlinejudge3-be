import { Model, Table, Column, DataType, Index, AllowNull, Default } from 'sequelize-typescript';
import { providerWrapper } from 'midway';

export const factory = () => CompileInfoModel;
providerWrapper([
  {
    id: 'compileInfoModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'compile_info',
  freezeTableName: true,
  timestamps: false,
})
export default class CompileInfoModel extends Model<CompileInfoModel> {
  @Column({
    field: 'compile_id',
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
    name: 'compile_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  compileId: number;

  @AllowNull(false)
  @Column({
    field: 'solution_id',
    type: DataType.INTEGER,
  })
  @Index({
    name: 'solution_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  solutionId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'compile_info',
    type: DataType.TEXT({ length: 'long' }),
  })
  compileInfo: string;
}

export type TCompileInfoModel = typeof CompileInfoModel;
export type CCompileInfoModel = CompileInfoModel;
