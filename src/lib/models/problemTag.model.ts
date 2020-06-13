import { Model, Table, Column, DataType, Index, ForeignKey } from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import ProblemModel from './problem.model';
import TagModel from './tag.model';

export const factory = () => ProblemTagModel;
providerWrapper([
  {
    id: 'problemTagModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'problem_tag',
  freezeTableName: true,
  timestamps: false,
})
export default class ProblemTagModel extends Model<ProblemTagModel> {
  @Column({
    field: 'problem_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  @ForeignKey(() => ProblemModel)
  problemId: number;

  @Column({
    field: 'tag_id',
    primaryKey: true,
    type: DataType.INTEGER,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  @ForeignKey(() => TagModel)
  tagId: number;
}

export type TProblemTagModel = typeof ProblemTagModel;
export type CProblemTagModel = ProblemTagModel;
