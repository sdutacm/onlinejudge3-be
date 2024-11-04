import { provide } from 'midway';

@provide()
export default class AchievementMeta implements defMeta.BaseMeta {
  module = 'achievement';
}

export type CAchievementMeta = AchievementMeta;
