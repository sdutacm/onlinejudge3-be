type IFavoriteTarget =
  | { problemId: number }
  | { contestId: number }
  | { setId: number }
  | { groupId: number };

export interface IFavoriteModel {
  favoriteId: number;
  userId: number;
  type: string;
  target: IFavoriteTarget | null;
  note: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

export type TFavoriteModelFields = keyof IFavoriteModel;

export type TMFavoriteLiteFields = Extract<
  TFavoriteModelFields,
  'messageId' | 'fromUserId' | 'toUserId' | 'title' | 'content' | 'read' | 'anonymous' | 'createdAt'
>;

export type TMFavoriteDetailFields = Extract<
  TFavoriteModelFields,
  'messageId' | 'fromUserId' | 'toUserId' | 'title' | 'content' | 'read' | 'anonymous' | 'createdAt'
>;
