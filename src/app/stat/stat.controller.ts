import { Context, controller, inject, provide, config } from 'midway';
import { route } from '@/lib/decorators/controller.decorator';
import { CStatMeta } from './stat.meta';
import { routesBe } from '@/common/routes';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { IUtils } from '@/utils';
import { IGetUserACRankReq, IGetUserACRankResp } from '@/common/contracts/stat';
import { CStatService } from './stat.service';

@provide()
@controller('/')
export default class StatController {
  @inject('statMeta')
  meta: CStatMeta;

  @inject('statService')
  service: CStatService;

  @inject()
  utils: IUtils;

  /**
   * 获取分时段用户 AC 数排名统计。
   * @returns 排名统计
   */
  @route()
  async [routesBe.getUserACRank.i](ctx: Context): Promise<IGetUserACRankResp> {
    const { type } = ctx.request.body as IGetUserACRankReq;
    const res = await this.service.getUserACRank(type);
    if (!res) {
      return {
        count: 0,
        rows: [],
        truncated: 0,
        startAt: '',
        _updateEvery: -1,
        _updatedAt: -1,
      };
    }
    return res;
  }
}
