export interface IStaticObjectModel<T = any> {
  key: string;
  category: string;
  userId: number | null;
  mime: string;
  content: T;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
