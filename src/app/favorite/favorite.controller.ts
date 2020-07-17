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
import { CPromiseQueue } from '@/utils/libs/promise-queue';

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
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject('PromiseQueue')
  PromiseQueue: CPromiseQueue;

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
}
