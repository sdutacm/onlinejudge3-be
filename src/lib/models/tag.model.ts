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
import { ITagModel } from '@/app/tag/tag.interface';
import ProblemModel from './problem.model';
import ProblemTagModel from './problemTag.model';

export const factory = () => TagModel;
providerWrapper([
  {
    id: 'tagModel',
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
  tableName: 'tag',
  freezeTableName: true,
  timestamps: false,
})
export default class TagModel extends Model<TagModel> implements ITagModel {
  @Column({
    field: 'tag_id',
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
  tagId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'name_en',
    type: DataType.STRING(32),
  })
  nameEn: string;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'name_zh_hans',
    type: DataType.STRING(32),
  })
  nameZhHans: string;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'name_zh_hant',
    type: DataType.STRING(32),
  })
  nameZhHant: string;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  hidden: boolean;

  @AllowNull(false)
  @Default(() => new Date())
  @Column({
    field: 'created_at',
    type: DataType.DATE,
  })
  createdAt: Date;

  @BelongsToMany(() => ProblemModel, () => ProblemTagModel)
  problems: Array<ProblemModel & { ProblemTagModel: ProblemTagModel }>;
}

export type TTagModel = typeof TagModel;
export type CTagModel = TagModel;
export type TTagModelScopes = keyof typeof scope;
