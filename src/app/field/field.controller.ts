import { Context, controller, inject, provide } from 'midway';
import { CFieldService } from './field.service';
import {
  id,
  getDetail,
  pagination,
  route,
  getList,
  respList,
  respDetail,
  authPerm,
  authPermOrRequireSelf,
} from '@/lib/decorators/controller.decorator';
import { CFieldMeta } from './field.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { ICreateFieldReq, ICreateFieldResp, IUpdateFieldDetailReq } from '@/common/contracts/field';
import { EPerm } from '@/common/configs/perm.config';

@provide()
@controller('/')
export default class FieldController {
  @inject('fieldMeta')
  meta: CFieldMeta;

  @inject('fieldService')
  service: CFieldService;

  @inject()
  utils: IUtils;

  @route()
  @pagination()
  @getList()
  @respList()
  async [routesBe.getFieldList.i](_ctx: Context) {}

  @route()
  @id()
  @getDetail()
  @respDetail()
  async [routesBe.getFieldDetail.i](_ctx: Context) {}

  @route()
  @authPerm(EPerm.WriteField)
  async [routesBe.createField.i](ctx: Context): Promise<ICreateFieldResp> {
    const { name, shortName } = ctx.request.body as ICreateFieldReq;
    const newId = await this.service.create({
      name,
      shortName,
    });
    return { fieldId: newId };
  }

  @route()
  @id()
  @getDetail(null)
  @authPermOrRequireSelf(undefined, EPerm.WriteField)
  async [routesBe.updateFieldDetail.i](ctx: Context): Promise<void> {
    const fieldId = ctx.id!;
    const { name, shortName, seatingArrangement, deleted } = ctx.request
      .body as IUpdateFieldDetailReq;
    await this.service.update(fieldId, {
      name,
      shortName,
      seatingArrangement,
      deleted,
    });
    await this.service.clearDetailCache(fieldId);
  }
}
