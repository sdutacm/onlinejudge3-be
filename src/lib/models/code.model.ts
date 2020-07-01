import { Model, Table, Column, DataType, Index, AllowNull, Default } from 'sequelize-typescript';
import { providerWrapper } from 'midway';

export const factory = () => CodeModel;
providerWrapper([
  {
    id: 'codeModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'code',
  freezeTableName: true,
  timestamps: false,
})
export default class CodeModel extends Model<CodeModel> {
  @Column({
    field: 'code_id',
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
    name: 'solution_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  @Index({
    name: 'code_id',
    using: 'BTREE',
    order: 'ASC',
    unique: false,
  })
  codeId: number;

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
    field: 'code_content',
    type: DataType.TEXT({ length: 'long' }),
  })
  codeContent: string;
}

export type TCodeModel = typeof CodeModel;
export type CCodeModel = CodeModel;
