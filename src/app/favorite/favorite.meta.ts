import { provide } from 'midway';

@provide()
export default class FavoriteMeta implements defMeta.BaseMeta {
  module = 'favorite';
  pk = 'favoriteId';
}

export type CFavoriteMeta = FavoriteMeta;
