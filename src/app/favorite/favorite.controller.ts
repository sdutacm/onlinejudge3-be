import { Context, controller, inject, provide } from 'midway';
import {
  route,
  pagination,
  login,
  getFullList,
  respFullList,
} from '@/lib/decorators/controller.decorator';
import { CFavoriteMeta } from './favorite.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CFavoriteService } from './favorite.service';
import { ILodash } from '@/utils/libs/lodash';
import { CUserService } from '../user/user.service';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { IAddFavoriteReq, IDeleteFavoriteReq } from '@/common/contracts/favorite';
import { CProblemService } from '../problem/problem.service';
import { CContestService } from '../contest/contest.service';

@provide()
@controller('/')
export default class FavoriteController {
  @inject('favoriteMeta')
  meta: CFavoriteMeta;

  @inject('favoriteService')
  service: CFavoriteService;

  @inject()
  userService: CUserService;

  @inject()
  problemService: CProblemService;

  @inject()
  contestService: CContestService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @route()
  @login()
  @pagination()
  @getFullList(undefined, {
    beforeGetFullList(ctx) {
      ctx.request.body.userId = ctx.session.userId;
    },
  })
  @respFullList()
  async [routesBe.getFavoriteList.i](_ctx: Context) {}

  @route()
  @login()
  async [routesBe.addFavorite.i](ctx: Context) {
    const { type, target, note } = ctx.request.body as IAddFavoriteReq;
    const userId = ctx.session.userId;
    switch (type) {
      case 'problem': {
        const { problemId, contestId } = target as { problemId: number; contestId?: number };
        if (
          !(
            (await this.problemService.getDetail(problemId)) ||
            (contestId &&
              ctx.helper.isContestLoggedIn(contestId) &&
              (await this.contestService.isProblemInContest(problemId, contestId)))
          )
        ) {
          throw new ReqError(Codes.GENERAL_NO_PERMISSION);
        }
        const newId = await this.service.create({
          userId,
          type,
          target: { problemId },
          note,
        });
        return { favoriteId: newId };
      }
      case 'contest': {
        const { contestId } = target as { contestId: number };
        if (!ctx.helper.isContestLoggedIn(contestId)) {
          throw new ReqError(Codes.GENERAL_NO_PERMISSION);
        }
        const newId = await this.service.create({
          userId,
          type,
          target: { contestId },
          note,
        });
        return { favoriteId: newId };
      }
      // TODO set/group
    }
  }

  @route()
  @login()
  async [routesBe.deleteFavorite.i](ctx: Context): Promise<void> {
    const { favoriteId } = ctx.request.body as IDeleteFavoriteReq;
    const userId = ctx.session.userId;
    const favorite = await this.service.getDetail(favoriteId, null);
    if (!favorite) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    } else if (favorite.userId !== userId) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    } else if (favorite.deleted) {
      throw new ReqError(Codes.FAVORITE_DELETED);
    }
    await this.service.update(favoriteId, {
      deleted: true,
    });
  }
}
