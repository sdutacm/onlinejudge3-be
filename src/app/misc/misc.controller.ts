import { Context, controller, inject, provide, config } from 'midway';
import { route, login, rateLimitUser, authPerm } from '@/lib/decorators/controller.decorator';
import { CMiscMeta } from './misc.meta';
import { routesBe } from '@/common/routes';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { IUtils } from '@/utils';
import { IAppConfig } from '@/config/config.interface';
import path from 'path';
import { IFs } from '@/utils/libs/fs-extra';
import {
  IUploadMediaResp,
  IUploadAssetResp,
  IGetStaticObjectReq,
  IGetStaticObjectResp,
} from '@/common/contracts/misc';
import { EPerm } from '@/common/configs/perm.config';
import { CCosHelper } from '@/utils/cos';
import { CMiscService } from './misc.service';

@provide()
@controller('/')
export default class MiscController {
  @inject('miscMeta')
  meta: CMiscMeta;

  @inject()
  utils: IUtils;

  @inject()
  fs: IFs;

  @inject('miscService')
  service: CMiscService;

  @config()
  staticPath: IAppConfig['staticPath'];

  @config()
  uploadLimit: IAppConfig['uploadLimit'];

  @inject()
  cosHelper: CCosHelper;

  /**
   * 上传媒体文件。
   *
   * 权限：需要登录
   *
   * 图片校验逻辑：
   * 1. 格式限制：jpeg/png/gif
   * 2. 大小限制
   *
   * 上传成功后保留原图。
   */
  @route()
  @login()
  @rateLimitUser(120, 20)
  async [routesBe.uploadMedia.i](ctx: Context): Promise<IUploadMediaResp> {
    const ALLOWED_TYPE = ['image/jpeg', 'image/png', 'image/gif'];
    const image = ctx.request.files?.filter((f) => f.field === 'image')[0];
    if (!image) {
      throw new ReqError(Codes.GENERAL_REQUEST_PARAMS_ERROR);
    }
    if (!ALLOWED_TYPE.includes(image.mime)) {
      throw new ReqError(Codes.GENERAL_INVALID_MEDIA);
    }
    const stat = this.fs.statSync(image.filepath);
    if (stat.size > this.uploadLimit.media) {
      throw new ReqError(Codes.GENERAL_INVALID_MEDIA_SIZE, {
        maxSize: this.uploadLimit.media,
      });
    }

    const ext = image.mime.split('/')[1];
    const saveName = `${ctx.session.userId}_${this.utils.misc.randomString({ length: 16 })}.${ext}`;
    switch (this.staticPath.useCloud) {
      case 'cos': {
        await this.cosHelper.uploadFile(
          this.fs.createReadStream(image.filepath),
          path.join(this.staticPath.media, saveName),
        );
        break;
      }
      default: {
        // 存储图片
        await this.fs.copyFile(image.filepath, path.join(this.staticPath.media, saveName));
      }
    }

    return {
      url: path.join(path.relative(this.staticPath.base, this.staticPath.media), saveName),
    };
  }

  /**
   * 上传资源文件。
   *
   * 图片校验逻辑：
   * 1. 格式限制：jpeg/png/gif
   * 2. 大小限制
   *
   * 上传成功后保留原图。
   */
  @route()
  @authPerm(EPerm.UploadAsset)
  async [routesBe.uploadAsset.i](ctx: Context): Promise<IUploadAssetResp> {
    const { prefix } = ctx.request.body;
    const ALLOWED_TYPE = ['image/jpeg', 'image/png', 'image/gif'];
    const image = ctx.request.files?.filter((f) => f.field === 'image')[0];
    if (!image) {
      throw new ReqError(Codes.GENERAL_REQUEST_PARAMS_ERROR);
    }
    if (!ALLOWED_TYPE.includes(image.mime)) {
      throw new ReqError(Codes.GENERAL_INVALID_MEDIA);
    }
    const stat = this.fs.statSync(image.filepath);
    if (stat.size > this.uploadLimit.asset) {
      throw new ReqError(Codes.GENERAL_INVALID_MEDIA_SIZE, {
        maxSize: this.uploadLimit.asset,
      });
    }

    const ext = image.mime.split('/')[1];
    let saveName = `${Date.now()}_${this.utils.misc.randomString({ length: 16 })}.${ext}`;
    if (prefix) {
      saveName = `${prefix}_${saveName}`;
    }
    switch (this.staticPath.useCloud) {
      case 'cos': {
        await this.cosHelper.uploadFile(
          this.fs.createReadStream(image.filepath),
          path.join(this.staticPath.asset, saveName),
        );
        break;
      }
      default: {
        // 存储图片
        await this.fs.copyFile(image.filepath, path.join(this.staticPath.asset, saveName));
      }
    }

    return {
      url: path.join(path.relative(this.staticPath.base, this.staticPath.asset), saveName),
    };
  }

  /**
   * 获取指定静态存储对象。
   */
  @route()
  @login()
  async [routesBe.getStaticObject.i](ctx: Context): Promise<IGetStaticObjectResp> {
    const { key } = ctx.request.body as IGetStaticObjectReq;
    const object = await this.service.getStaticObject({ key, userId: null });
    if (!object) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    delete object.userId;
    return (object as unknown) as TreatDateFieldsAsString<IGetStaticObjectResp>;
  }
}
