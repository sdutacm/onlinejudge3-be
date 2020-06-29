import { Model, Table, Column, DataType, Index, AllowNull, Default } from 'sequelize-typescript';
import { providerWrapper } from 'midway';
import { IMessageModel } from '@/app/message/message.interface';

export const factory = () => MessageModel;
providerWrapper([
  {
    id: 'messageModel',
    provider: factory,
  },
]);

@Table({
  tableName: 'message',
  freezeTableName: true,
  timestamps: false,
})
export default class MessageModel extends Model<MessageModel> implements IMessageModel {
  @Column({
    field: 'mes_id',
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
  messageId: number;

  @AllowNull(false)
  @Column({
    field: 'from_user',
    type: DataType.INTEGER,
  })
  fromUserId: number;

  @AllowNull(false)
  @Column({
    field: 'to_user',
    type: DataType.INTEGER,
  })
  toUserId: number;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'mes_title',
    type: DataType.STRING(200),
  })
  title: string;

  @AllowNull(false)
  @Default('')
  @Column({
    field: 'mes_content',
    type: DataType.STRING,
  })
  content: string;

  // @AllowNull(false)
  // @Default(false)
  // @Column({
  //   field: 'from_delete',
  //   type: DataType.BOOLEAN,
  // })
  // fromUserDeleted: boolean;

  // @AllowNull(false)
  // @Default(false)
  // @Column({
  //   field: 'to_delete',
  //   type: DataType.BOOLEAN,
  // })
  // toUserDeleted: boolean;

  @AllowNull(false)
  @Default(() => new Date())
  @Column({
    field: 'send_time',
    type: DataType.DATE,
  })
  get createdAt(): IMessageModel['createdAt'] {
    const value = this.getDataValue('createdAt');
    if (value instanceof Date && Number.isNaN(value.getTime())) {
      return null;
    }
    return value ?? null;
  }
  set createdAt(value: IMessageModel['createdAt']) {
    this.setDataValue('createdAt', value);
  }

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'have_read',
    type: DataType.BOOLEAN,
  })
  read: boolean;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  anonymous: boolean;
}

export type TMessageModel = typeof MessageModel;
export type CMessageModel = MessageModel;
