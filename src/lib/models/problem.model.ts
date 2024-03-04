import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Scopes,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  Default,
  BelongsToMany,
} from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { IProblemModel } from '@/app/problem/problem.interface';
import TagModel from './tag.model';
import ProblemTagModel from './problemTag.model';

export const factory = () => ProblemModel;
providerWrapper([
  {
    id: 'problemModel',
    provider: factory,
  },
]);

const scope = {
  available: {
    where: { display: true },
  },
};

@Scopes(scope)
@Table({
  tableName: 'problem',
  freezeTableName: true,
  timestamps: true,
})
export default class ProblemModel extends Model<ProblemModel> implements IProblemModel {
  @Column({
    field: 'problem_id',
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
  problemId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(50),
  })
  title: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT({ length: 'medium' }),
  })
  description: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT({ length: 'medium' }),
  })
  input: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT({ length: 'medium' }),
  })
  output: string;

  /** @deprecated */
  @AllowNull(false)
  @Default('')
  @Column({
    field: 'sample_input',
    type: DataType.TEXT({ length: 'medium' }),
  })
  sampleInput: string;

  /** @deprecated */
  @AllowNull(false)
  @Default('')
  @Column({
    field: 'sample_output',
    type: DataType.TEXT({ length: 'medium' }),
  })
  sampleOutput: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT({ length: 'medium' }),
  })
  get samples(): IProblemModel['samples'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('samples')) || [];
    } catch (e) {
      console.error('ProblemModel.samples getter error:', e);
      return [];
    }
  }
  set samples(value: IProblemModel['samples']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('samples', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('samples', '');
    }
  }

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.TEXT({ length: 'medium' }),
  })
  hint: string;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(400),
  })
  source: string;

  /** @deprecated */
  @AllowNull(true)
  @Column({
    type: DataType.STRING(400),
  })
  author: number | null;

  @AllowNull(false)
  @Default('')
  @Column({
    type: DataType.STRING(256),
  })
  get authors(): IProblemModel['authors'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('authors')) || [];
    } catch (e) {
      return [];
    }
  }
  set authors(value: IProblemModel['authors']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('authors', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('authors', '');
    }
  }

  @AllowNull(false)
  @CreatedAt
  @Column({
    field: 'add_time',
    type: DataType.DATE,
  })
  createdAt: Date;

  @AllowNull(true)
  @UpdatedAt
  @Column({
    field: 'modify_time',
    type: DataType.DATE,
  })
  get updatedAt(): IProblemModel['updatedAt'] {
    const value = this.getDataValue('updatedAt');
    if (value instanceof Date && Number.isNaN(value.getTime())) {
      return null;
    }
    return value ?? null;
  }
  set updatedAt(value: IProblemModel['updatedAt']) {
    this.setDataValue('updatedAt', value);
  }

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'time_limit',
    type: DataType.INTEGER,
  })
  timeLimit: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'memory_limit',
    type: DataType.INTEGER,
  })
  memoryLimit: number;

  @AllowNull(false)
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  display: boolean;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'accept',
    type: DataType.INTEGER,
  })
  accepted: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    field: 'submit',
    type: DataType.INTEGER,
  })
  submitted: number;

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'is_special_judge',
    type: DataType.BOOLEAN,
  })
  spj: boolean;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  difficulty: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'sp_config',
    type: DataType.TEXT({ length: 'medium' }),
  })
  get spConfig(): IProblemModel['spConfig'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('spConfig')) || {};
    } catch (e) {
      return {};
    }
  }
  set spConfig(value: IProblemModel['spConfig']) {
    if (value) {
      // @ts-ignore
      this.setDataValue('spConfig', JSON.stringify(value));
    } else {
      // @ts-ignore
      this.setDataValue('spConfig', '');
    }
  }

  @AllowNull(false)
  @Default(1)
  @Column({
    type: DataType.INTEGER,
  })
  revision: number;

  @BelongsToMany(() => TagModel, () => ProblemTagModel)
  tags: Array<TagModel & { ProblemTagModel: ProblemTagModel }>;
}

export type TProblemModel = typeof ProblemModel;
export type CProblemModel = ProblemModel;
export type TProblemModelScopes = keyof typeof scope;
