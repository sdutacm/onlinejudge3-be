import { provide, inject, Context, config } from 'midway';
import { CStatMeta } from './stat.meta';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { IMStatServiceGetUserACRankRes, IMStatUserACRankPlain } from './stat.interface';
import { CUserService } from '../user/user.service';

export type CStatService = StatService;

@provide()
export default class StatService {
  @inject('statMeta')
  meta: CStatMeta;

  @inject()
  userService: CUserService;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @inject()
  lodash: ILodash;

  @config()
  redisKey: IRedisKeyConfig;

  /**
   * 获取分时段用户 AC 数排名。
   * @param type 时段类型
   */
  async getUserACRank(type: 'day' | 'week' | 'month'): Promise<IMStatServiceGetUserACRankRes> {
    const data = await this.ctx.helper.redisGet<IMStatUserACRankPlain>(this.redisKey.userACStats, [
      type,
    ]);
    if (!data) {
      return null;
    }
    const userIds = data.rows.map((d) => d.userId);
    const relativeUsers = await this.userService.getRelative(userIds, null);
    return {
      ...data,
      rows: data.rows.map((d) => {
        const user = relativeUsers[d.userId];
        return this.utils.misc.ignoreUndefined({
          ...this.lodash.omit(d, ['userId']),
          user: {
            userId: user?.userId,
            username: user?.username,
            nickname: user?.nickname,
            avatar: user?.avatar,
            bannerImage: user?.bannerImage,
          },
        });
      }),
    };
  }
}
