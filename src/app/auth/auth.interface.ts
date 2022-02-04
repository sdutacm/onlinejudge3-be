import { IUserModel } from '../user/user.interface';
import { EPerm } from '@/common/configs/perm.config';

//#region service.getAllUserPermissionsMap
export type IMAuthServiceGetAllUserPermissionsMapRes = Record<IUserModel['userId'], EPerm[]>;
//#endregion
