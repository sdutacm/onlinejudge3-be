export interface IStaticObjectModel<T = any> {
  key: string;
  category: string;
  userId: number | null;
  mime: string;
  content: T;
  createdAt: Date;
  updatedAt: Date;
}
