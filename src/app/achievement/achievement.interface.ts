import { EAchievementKey } from '@/common/configs/achievement.config';

export interface IAchievementRateItem {
  achievementKey: EAchievementKey;
  achievedUserCount: number;
}
