import { provide, inject, Context, config } from 'midway';
import { CNoteMeta } from './note.meta';
import { TNoteModel, TNoteModelScopes } from '@/lib/models/note.model';
import {
  TMNoteDetailFields,
  INoteModel,
  IMNoteServiceGetFullListOpt,
  IMNoteServiceGetFullListRes,
  IMNoteServiceIsExistsOpt,
  IMNoteServiceCreateOpt,
  IMNoteServiceCreateRes,
  IMNoteServiceUpdateOpt,
  IMNoteServiceUpdateRes,
  IMNoteDetail,
  IMNoteServiceGetDetailRes,
  IMNoteServiceFindOneOpt,
  IMNoteServiceFindOneRes,
  IMNoteDetailPlain,
  IMNoteFullListPagination,
  IMNoteDetailTypeProblem,
  IMNoteDetailTypeSolution,
} from './note.interface';
import { Op } from 'sequelize';
import { IUtils } from '@/utils';
import { CProblemService } from '../problem/problem.service';
import { CContestService } from '../contest/contest.service';
import { CSolutionService } from '../solution/solution.service';

export type CNoteService = NoteService;

const noteDetailFields: Array<TMNoteDetailFields> = [
  'noteId',
  'userId',
  'type',
  'target',
  'content',
  'createdAt',
  'updatedAt',
  'deleted',
];

@provide()
export default class NoteService {
  @inject('noteMeta')
  meta: CNoteMeta;

  @inject('noteModel')
  model: TNoteModel;

  @inject()
  problemService: CProblemService;

  @inject()
  contestService: CContestService;

  @inject()
  solutionService: CSolutionService;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  private _formatFullListQuery(opts: IMNoteServiceGetFullListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      userId: opts.userId,
      type: opts.type,
    });
    if (opts.content) {
      where.content = {
        [Op.like]: `%${opts.content}%`,
      };
    }
    return {
      where,
    };
  }

  private async _handleRelativeData(data: IMNoteDetailPlain[]): Promise<IMNoteDetail[]> {
    const problemIds = data.map((d) => d.target?.problemId).filter((f) => f) as number[];
    const contestIds = data.map((d) => d.target?.contestId).filter((f) => f) as number[];
    const solutionIds = data.map((d) => d.target?.solutionId).filter((f) => f) as number[];
    const relativeProblem = await this.problemService.getRelative(problemIds, null);
    const relativeContest = await this.contestService.getRelative(contestIds, null);
    const relativeSolution = await this.solutionService.getRelative(solutionIds);
    let res: IMNoteDetail[] = [];
    // @ts-ignore
    for (const d of data) {
      switch (d.type) {
        case 'problem': {
          const { problemId, contestId } = d.target as { problemId: number; contestId?: number };
          let contest: IMNoteDetailTypeProblem['target']['contest'];
          if (contestId && relativeContest[contestId]) {
            const contestProblems = await this.contestService.getContestProblems(contestId);
            const problemIndex = contestProblems.rows.findIndex(
              (problem) => problem.problemId === problemId,
            );
            contest = {
              contestId,
              title: relativeContest[contestId].title,
              problemIndex,
            };
          }
          res.push(
            this.utils.misc.ignoreUndefined({
              ...d,
              type: 'problem',
              target: {
                problemId,
                title: relativeProblem[problemId]?.title,
                contest,
              },
            }),
          );
          break;
        }
        case 'contest': {
          const { contestId } = d.target as { contestId: number };
          res.push(
            this.utils.misc.ignoreUndefined({
              ...d,
              type: 'contest',
              target: {
                contestId,
                title: relativeContest[contestId]?.title,
              },
            }),
          );
          break;
        }
        case 'solution': {
          const { solutionId } = d.target as { solutionId: number };
          const solution = relativeSolution[solutionId];
          const problemId = solution.problem?.problemId;
          const contestId = solution.contest?.contestId;
          let contest: IMNoteDetailTypeSolution['target']['contest'];
          if (contestId) {
            const contestProblems = await this.contestService.getContestProblems(contestId);
            const problemIndex = contestProblems.rows.findIndex(
              (problem) => problem.problemId === problemId,
            );
            contest = {
              contestId,
              title: solution.contest!.title,
              problemIndex,
            };
          }
          res.push(
            this.utils.misc.ignoreUndefined({
              ...d,
              type: 'solution',
              target: {
                solutionId,
                result: solution.result,
                problem: {
                  problemId,
                  title: solution.problem?.title,
                },
                contest,
              },
            }),
          );
          break;
        }
        default: {
          // @ts-ignore
          res.push(d);
        }
      }
    }
    return res;
  }

  /**
   * 获取笔记全列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getFullList(
    options: IMNoteServiceGetFullListOpt,
    pagination: IMNoteFullListPagination = {},
    scope: TNoteModelScopes | null = 'available',
  ): Promise<IMNoteServiceGetFullListRes> {
    const query = this._formatFullListQuery(options);
    const res = await this.model
      .scope(scope || undefined)
      .findAll({
        attributes: noteDetailFields,
        where: query.where,
        order: pagination.order,
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMNoteDetailPlain));
    return {
      count: res.length,
      rows: await this._handleRelativeData(res),
    };
  }

  /**
   * 获取笔记详情。
   * @param noteId noteId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    noteId: INoteModel['noteId'],
    scope: TNoteModelScopes | null = 'available',
  ): Promise<IMNoteServiceGetDetailRes> {
    const res = await this.model
      .scope(scope || undefined)
      .findOne({
        attributes: noteDetailFields,
        where: {
          noteId,
        },
      })
      .then((d) => d && (d.get({ plain: true }) as IMNoteDetailPlain));
    if (!res) {
      return res;
    }
    const [ret] = await this._handleRelativeData([res]);
    return ret;
  }

  /**
   * 按条件查询笔记详情。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async findOne(
    options: IMNoteServiceFindOneOpt,
    scope: TNoteModelScopes | null = 'available',
  ): Promise<IMNoteServiceFindOneRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: noteDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMNoteDetail));
  }

  /**
   * 按条件查询笔记是否存在。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async isExists(
    options: IMNoteServiceIsExistsOpt,
    scope: TNoteModelScopes | null = 'available',
  ): Promise<boolean> {
    const res = await this.model.scope(scope || undefined).findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建笔记。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMNoteServiceCreateOpt): Promise<IMNoteServiceCreateRes> {
    const res = await this.model.create(data);
    return res.noteId;
  }

  /**
   * 更新笔记（部分更新）。
   * @param noteId noteId
   * @param data 更新数据
   */
  async update(
    noteId: INoteModel['noteId'],
    data: IMNoteServiceUpdateOpt,
  ): Promise<IMNoteServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        noteId,
      },
    });
    return res[0] > 0;
  }
}
