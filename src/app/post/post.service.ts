import { provide, inject, Context, config } from 'midway';
import { CPostMeta } from './post.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { TPostModel, TPostModelScopes } from '@/lib/models/post.model';
import {
  TMPostLiteFields,
  TMPostDetailFields,
  IPostModel,
  IMPostServiceGetListOpt,
  IMPostServiceGetListRes,
  IMPostServiceIsExistsOpt,
  IMPostServiceCreateOpt,
  IMPostServiceCreateRes,
  IMPostServiceUpdateOpt,
  IMPostServiceUpdateRes,
  IMPostServiceGetDetailRes,
  IMPostServiceFindOneOpt,
  IMPostServiceFindOneRes,
  IMPostListPagination,
  IMPostLitePlain,
  IMPostDetailPlain,
  IMPostRelativeUser,
} from './post.interface';
import { Op } from 'sequelize';
import { IUtils } from '@/utils';
import { CUserService } from '../user/user.service';
import { ILodash } from '@/utils/libs/lodash';

export type CPostService = PostService;

const postLiteFields: Array<TMPostLiteFields> = [
  'postId',
  'userId',
  'title',
  'createdAt',
  'display',
];

const postDetailFields: Array<TMPostDetailFields> = [
  'postId',
  'userId',
  'title',
  'content',
  'createdAt',
  'display',
];

@provide()
export default class PostService {
  @inject('postMeta')
  meta: CPostMeta;

  @inject('postModel')
  model: TPostModel;

  @inject()
  userService: CUserService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject()
  ctx: Context;

  @config()
  durations: IDurationsConfig;

  scopeChecker = {
    available(data: Partial<IPostModel> | null): boolean {
      return data?.display === true;
    },
  };

  /**
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param postId postId
   */
  private async _getDetailCache(
    postId: IPostModel['postId'],
  ): Promise<IMPostDetailPlain | null | ''> {
    return this.ctx.helper
      .redisGet<IMPostDetailPlain>(this.meta.detailCacheKey, [postId])
      .then((res) => this.utils.misc.processDateFromJson(res, ['createdAt']));
  }

  /**
   * 设置详情缓存。
   * @param postId postId
   * @param data 详情数据
   */
  private async _setDetailCache(
    postId: IPostModel['postId'],
    data: IMPostDetailPlain | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.meta.detailCacheKey,
      [postId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  private _formatListQuery(opts: IMPostServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      postId: opts.postId,
      userId: opts.userId,
    });
    if (opts.title) {
      where.title = {
        [Op.like]: `%${opts.title}%`,
      };
    }
    return {
      where,
    };
  }

  private async _handleRelativeData<T extends IMPostLitePlain>(
    data: T[],
  ): Promise<
    Array<
      Omit<T, 'userId'> & {
        user?: IMPostRelativeUser;
      }
    >
  > {
    const userIds = data.map((d) => d.userId);
    const relativeUsers = await this.userService.getRelative(userIds, null);
    return data.map((d) => {
      const user = relativeUsers[d.userId];
      return this.utils.misc.ignoreUndefined({
        ...this.lodash.omit(d, ['userId']),
        user: user
          ? {
              userId: user.userId,
              username: user.username,
              nickname: user.nickname,
              avatar: user.avatar,
              bannerImage: user.bannerImage,
            }
          : undefined,
      });
    });
  }

  /**
   * 获取文章列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getList(
    options: IMPostServiceGetListOpt,
    pagination: IMPostListPagination = {},
    scope: TPostModelScopes | null = 'available',
  ): Promise<IMPostServiceGetListRes> {
    const query = this._formatListQuery(options);
    const res = await this.model
      .scope(scope || undefined)
      .findAndCountAll({
        attributes: postLiteFields,
        where: query.where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMPostLitePlain),
      }));
    return {
      ...res,
      rows: await this._handleRelativeData(res.rows),
    };
  }

  /**
   * 获取文章详情。
   * @param postId postaId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    postId: IPostModel['postId'],
    scope: TPostModelScopes | null = 'available',
  ): Promise<IMPostServiceGetDetailRes> {
    let res: IMPostDetailPlain | null = null;
    const cached = await this._getDetailCache(postId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        .scope(scope || undefined)
        .findOne({
          attributes: postDetailFields,
          where: {
            postId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMPostDetailPlain));
      await this._setDetailCache(postId, res);
    }
    // 使用缓存，业务上自己处理 scope
    if (res && (scope === null || this.scopeChecker[scope](res))) {
      const [ret] = await this._handleRelativeData([res]);
      return ret;
    }
    return null;
  }

  /**
   * 按条件查询文章详情。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async findOne(
    options: IMPostServiceFindOneOpt,
    scope: TPostModelScopes | null = 'available',
  ): Promise<IMPostServiceFindOneRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: postDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMPostDetailPlain));
  }

  /**
   * 按条件查询文章是否存在。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async isExists(
    options: IMPostServiceIsExistsOpt,
    scope: TPostModelScopes | null = 'available',
  ): Promise<boolean> {
    const res = await this.model.scope(scope || undefined).findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建文章。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMPostServiceCreateOpt): Promise<IMPostServiceCreateRes> {
    const res = await this.model.create(data);
    return res.postId;
  }

  /**
   * 更新文章（部分更新）。
   * @param postId postId
   * @param data 更新数据
   */
  async update(
    postId: IPostModel['postId'],
    data: IMPostServiceUpdateOpt,
  ): Promise<IMPostServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        postId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除详情缓存。
   * @param postId postId
   */
  async clearDetailCache(postId: IPostModel['postId']): Promise<void> {
    return this.ctx.helper.redisDel(this.meta.detailCacheKey, [postId]);
  }
}
