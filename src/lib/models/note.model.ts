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
import { INoteModel } from '@/app/note/note.interface';

export const factory = () => NoteModel;
providerWrapper([
  {
    id: 'noteModel',
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
  tableName: 'note',
  freezeTableName: true,
  timestamps: true,
})
export default class NoteModel extends Model<NoteModel> implements INoteModel {
  @Column({
    field: 'note_id',
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
  noteId: number;

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
  get target(): INoteModel['target'] {
    try {
      // @ts-ignore
      return JSON.parse(this.getDataValue('target'));
    } catch (e) {
      return null;
    }
  }
  set target(value: INoteModel['target']) {
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
  content: string;

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

export type TNoteModel = typeof NoteModel;
export type CNoteModel = NoteModel;
export type TNoteModelScopes = keyof typeof scope;
