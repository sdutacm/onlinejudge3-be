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

  @route()
  @login()
  async [routesBe.addNote.i](ctx: Context) {
    const { type, target, content } = ctx.request.body as IAddNoteReq;
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
          content,
        });
        return { noteId: newId };
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
          content,
        });
        return { noteId: newId };
      }
      case 'solution': {
        const { solutionId } = target as { solutionId: number };
        const solution = await this.solutionService.getDetail(solutionId);
        if (!solution) {
          throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
        }
        if (
          !ctx.isPerm &&
          !solution.shared &&
          !this.solutionService.isSolutionSelf(ctx, solution)
        ) {
          throw new ReqError(Codes.GENERAL_NO_PERMISSION);
        }
        const newId = await this.service.create({
          userId,
          type,
          target: { solutionId },
          content,
        });
        return { noteId: newId };
      }
      case '': {
        const newId = await this.service.create({
          userId,
          type,
          target,
          content,
        });
        return { noteId: newId };
      }
      default: {
        this.utils.misc.never(type);
        return null;
      }
    }
  }

  @route()
  @login()
  async [routesBe.deleteNote.i](ctx: Context): Promise<void> {
    const { noteId } = ctx.request.body as IDeleteNoteReq;
    const userId = ctx.session.userId;
    const note = await this.service.getDetail(noteId, null);
    if (!note) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    } else if (note.userId !== userId) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    } else if (note.deleted) {
      throw new ReqError(Codes.NOTE_DELETED);
    }
    await this.service.update(noteId, {
      deleted: true,
    });
  }
}
