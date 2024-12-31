import { provide, inject, Context } from 'midway';
import { CMiscMeta } from './misc.meta';
import { TStaticObjectModel } from '@/lib/models/staticObject.model';
import { IStaticObjectModel } from './misc.interface';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';

export type CMiscService = MiscService;

@provide()
export default class MiscService {
  @inject('miscMeta')
  meta: CMiscMeta;

  @inject('staticObjectModel')
  staticObjectModel: TStaticObjectModel;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject()
  ctx: Context;

  async getStaticObject<T>(options: {
    key: IStaticObjectModel['key'];
    category?: IStaticObjectModel['category'];
    userId?: IStaticObjectModel['userId'];
  }): Promise<IStaticObjectModel<T> | null> {
    const where: any = this.utils.misc.ignoreUndefined({
      key: options.key,
      category: options.category,
      userId: options.userId,
    });
    await this.staticObjectModel.increment('viewCount', {
      by: 1,
      where,
    });
    const res = await this.staticObjectModel
      .findOne({
        where,
      })
      .then((d) => d && (d.get({ plain: true }) as IStaticObjectModel));
    if (!res) {
      return null;
    }
    switch (res.mime) {
      case 'application/json':
        res.content = JSON.parse(res.content);
        break;
    }
    return res;
  }
}
