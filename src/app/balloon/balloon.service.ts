import { provide, inject, Context, config } from 'midway';
import { CBalloonMeta } from './balloon.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { TBalloonModel } from '@/lib/models/balloon.model';
import {
  TMBalloonLiteFields,
  IMBalloonLite,
  IMBalloonDetail,
  TMBalloonDetailFields,
  BalloonProblemConfig,
  BalloonProblemConfigMap,
  IBalloonModel,
  IMBalloonGetBalloonsByCompetitionIdRes,
  IMBalloonServiceUpdateOpt,
  IMBalloonServiceUpdateRes,
  IMBalloonServiceFindOneOpt,
  IMBalloonServiceFindOneRes,
} from './balloon.interface';
import { IUtils } from '@/utils';
import {
  ICompetitionModel,
  IMCompetitionUserLite,
  ICompetitionSettingModel,
} from '../competition/competition.interface';
import { CSolutionService } from '@/app/solution/solution.service';
import { TCompetitionProblemModel } from '@/lib/models/competitionProblem.model';
import { CCompetitionService } from '@/app/competition/competition.service';
import { IMSolutionLitePlain } from '@/app/solution/solution.interface';
import { TCompetitionSettingModel } from '@/lib/models/competitionSetting.model';
import { ESolutionResult, EBalloonType, EBalloonStatus } from '@/common/enums';
import { IRedisKeyConfig } from '@/config/redisKey.config';

export type CBalloonService = BalloonService;

const balloonLiteFields: Array<TMBalloonLiteFields> = [
  'balloonId',
  'solutionId',
  'competitionId',
  'userId',
  'problemId',
  'problemIndex',
  'balloonAlias',
  'balloonColor',
  'nickname',
  'subname',
  'fieldShortName',
  'seatNo',
  'type',
  'status',
  'assignedUserId',
  'isFb',
  'createdAt',
  'updatedAt',
];

const balloonDetailFields: Array<TMBalloonDetailFields> = [
  'balloonId',
  'solutionId',
  'competitionId',
  'userId',
  'problemId',
  'problemIndex',
  'balloonAlias',
  'balloonColor',
  'nickname',
  'subname',
  'fieldShortName',
  'seatNo',
  'type',
  'status',
  'assignedUserId',
  'isFb',
  'createdAt',
  'updatedAt',
];

@provide()
export default class BalloonService {
  @inject('balloonMeta')
  meta: CBalloonMeta;

  @inject('balloonModel')
  model: TBalloonModel;

  @inject()
  competitionSettingModel: TCompetitionSettingModel;

  @inject()
  solutionService: CSolutionService;

  @inject()
  competitionProblemModel: TCompetitionProblemModel;

  @inject()
  competitionService: CCompetitionService;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @config()
  durations: IDurationsConfig;

  @config()
  redisKey: IRedisKeyConfig;

  /**
   * 获取指定比赛的全部气球列表。
   * @param competitionId competitionId
   */
  async getBalloonsByCompetitionId(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMBalloonGetBalloonsByCompetitionIdRes> {
    const isLock = await this.ctx.helper
      .redisGet<string>(this.redisKey.lockCompetitionBallonCalc, [competitionId])
      .then((ret) => (ret ? Number(ret) === 1 : false));
    if (isLock) {
      this.ctx.logger.info(`calc balloon is locked for competition ${competitionId}, skipped`);
    } else {
      try {
        await this.ctx.helper.redisSet(
          this.redisKey.lockCompetitionBallonCalc,
          [competitionId],
          '1',
          60,
        );
        const competition = await this.competitionService.getDetail(competitionId, null);
        if (!competition || !competition.startAt || !competition.endAt) {
          return {
            count: 0,
            rows: [],
          };
        }
        const competitionSetting = await this.competitionSettingModel
          .findOne({
            where: {
              competitionId,
            },
          })
          .then((r) => r && (r.get({ plain: true }) as ICompetitionSettingModel));
        const frozenLength = competitionSetting?.frozenLength || 0;
        const endAt =
          competition.endAt instanceof Date ? competition.endAt : new Date(competition.endAt);
        const frozenStart = new Date(endAt.getTime() - frozenLength * 1000);
        // 获取当前比赛的题目配置
        const problemConfig = await this.competitionService.getCompetitionProblemConfig(
          competitionId,
        );
        const problem: BalloonProblemConfigMap = {};
        const balloonSolution: {
          solution: IMSolutionLitePlain;
          user: IMCompetitionUserLite;
          problem: BalloonProblemConfig;
          isFb: boolean;
        }[] = [];
        for (const [index, config] of problemConfig.rows.entries()) {
          problem[config.problemId] = {
            index,
            config,
            solutions: [],
          };
        }
        // 获取当前比赛的用户信息
        const allUser = await this.competitionService.getCompetitionUsers(competitionId);
        const userConfig: Record<number, IMCompetitionUserLite> = {};
        for (const usr of allUser.rows) {
          userConfig[usr.userId] = usr;
        }

        // 获取当前比赛的提交记录
        const solutions = await this.solutionService.getAllCompetitionSolutionList(competitionId);
        // 顺序判断提交，直到遇到没出结果的提交为止
        for (const solution of solutions) {
          if (!userConfig[solution.userId]) {
            continue;
          }
          const solutionCreatedAt =
            solution.createdAt instanceof Date ? solution.createdAt : new Date(solution.createdAt);
          if (frozenStart <= solutionCreatedAt) {
            continue;
          }
          if (
            [
              ESolutionResult.RPD,
              ESolutionResult.WT,
              ESolutionResult.JG,
              ESolutionResult.SE,
            ].includes(solution.result)
          ) {
            break;
          }
          // AC
          if (solution.result === ESolutionResult.AC) {
            const problemConf = problem[solution.problemId];
            if (!problemConf) {
              continue;
            }

            // 不重复计算同一个人的后续 ac
            let submitted = false;
            for (const slu of problemConf.solutions) {
              if (slu.userId === solution.userId) {
                submitted = true;
                break;
              }
            }
            if (submitted) {
              continue;
            }

            balloonSolution.push({
              solution,
              user: userConfig[solution.userId],
              problem: problemConf,
              isFb: problemConf.solutions.length === 0,
            });
            problemConf.solutions.push(solution);
          }
        }

        // 获取已有的气球数据
        const balloonsRes = await this.getAllBalloonsByCompetitionId(competitionId);

        // userId-problemId-isFb
        const oldStr: string[] = [];
        const newStr: string[] = [];
        for (const elem of balloonsRes) {
          const str = `${elem.userId}-${elem.problemId}-${elem.isFb}`;
          if (!oldStr.includes(str)) {
            oldStr.push(str);
          }
        }
        for (const elem of balloonSolution) {
          const str = `${elem.user.userId}-${elem.problem.config.problemId}-${elem.isFb}`;
          newStr.push(str);
        }
        // diff
        const needInsert = newStr.filter((elem) => !oldStr.includes(elem));

        // 新增的直接创建
        for (const str of needInsert) {
          const [userIdStr, problemIdStr, isFbStr] = str.split('-');
          const userId = Number(userIdStr);
          const problemId = Number(problemIdStr);
          const isFb = isFbStr === 'true';
          const solution = solutions.find(
            (elem) => elem.userId === userId && elem.problemId === problemId,
          );
          await this.model.create({
            competitionId,
            userId,
            problemId,
            isFb,
            problemIndex: problem[problemId].index,
            type: EBalloonType.delivery,
            status: EBalloonStatus.pending,
            solutionId: solution!.solutionId,
            balloonAlias: problem[problemId].config.balloonAlias,
            balloonColor: problem[problemId].config.balloonColor,
            nickname: userConfig[userId].info?.nickname,
            fieldShortName: userConfig[userId].fieldShortName,
            seatNo: userConfig[userId].seatNo,
            subname: userConfig[userId].info?.subname,
          });
        }
      } catch (e) {
        this.ctx.logger.error(`calc balloons error for competition ${competitionId}:`, e);
      } finally {
        await this.ctx.helper.redisDel(this.redisKey.lockCompetitionBallonCalc, [competitionId]);
      }
    }

    const res = await this.getAllBalloonsByCompetitionId(competitionId);
    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 获取指定比赛的全部气球列表。
   * @param competitionId competitionId
   */
  async getAllBalloonsByCompetitionId(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMBalloonLite[]> {
    return this.model
      .findAll({
        attributes: balloonLiteFields,
        where: {
          competitionId,
        },
        order: [['balloon_id', 'ASC']],
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMBalloonLite));
  }

  /**
   * 按条件查询比赛详情。
   * @param options 查询参数
   */
  async findOne(options: IMBalloonServiceFindOneOpt): Promise<IMBalloonServiceFindOneRes> {
    return this.model
      .findOne({
        attributes: balloonDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMBalloonDetail));
  }

  /**
   * 更新气球（部分更新）。
   * @param balloonId balloonId
   * @param data 更新数据
   */
  async update(
    balloonId: IBalloonModel['balloonId'],
    data: IMBalloonServiceUpdateOpt,
  ): Promise<IMBalloonServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        balloonId,
      },
    });
    return res[0] > 0;
  }
}
