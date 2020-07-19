import { Context, controller, inject, provide } from 'midway';
import {
  route,
  pagination,
  login,
  getFullList,
  respFullList,
} from '@/lib/decorators/controller.decorator';
import { CNoteMeta } from './note.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CNoteService } from './note.service';
import { ILodash } from '@/utils/libs/lodash';
import { CUserService } from '../user/user.service';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { IAddNoteReq, IDeleteNoteReq } from '@/common/contracts/note';
import { CProblemService } from '../problem/problem.service';
import { CContestService } from '../contest/contest.service';
import { CSolutionService } from '../solution/solution.service';

@provide()
@controller('/')
export default class NoteController {
  @inject('noteMeta')
  meta: CNoteMeta;

  @inject('noteService')
  service: CNoteService;

  @inject()
  userService: CUserService;

  @inject()
  problemService: CProblemService;

  @inject()
  contestService: CContestService;

  @inject()
  solutionService: CSolutionService;

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
  async [routesBe.getNoteList.i](_ctx: Context) {}
}
