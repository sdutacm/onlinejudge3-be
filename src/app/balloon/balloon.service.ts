import { provide, inject, Context, config } from 'midway';
import { CBalloonMeta } from './balloon.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { TBalloonModel } from '@/lib/models/balloon.model';
import {
  TMBalloonLiteFields,
  IMBalloonGetBalloonsByCompetitionIdRes,
  IMBalloonLite, BalloonProblemConfig, BalloonProblemConfigMap,
} from './balloon.interface';
import { IUtils } from '@/utils';
import {
  ICompetitionModel,
  IMCompetitionUserLite
} from '../competition/competition.interface';
import { CSolutionService } from "@/app/solution/solution.service";
import { TCompetitionProblemModel } from "@/lib/models/competitionProblem.model";
import { CCompetitionService } from "@/app/competition/competition.service";
import { IMSolutionLitePlain } from "@/app/solution/solution.interface";

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
  solutionService: CSolutionService;

  @inject()
  competitionProblemModel: TCompetitionProblemModel;

  @inject()
  competitionService: CCompetitionService

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @config()
  durations: IDurationsConfig;

  /**
   * 获取指定比赛的全部气球列表。
   * @param competitionId competitionId
   */
  async getBalloonsByCompetitionId(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMBalloonGetBalloonsByCompetitionIdRes> {
    // 获取当前比赛的题目配置
    const problemConfig = await this.competitionService.getCompetitionProblemConfig(competitionId)
    const problem: BalloonProblemConfigMap = {}
    const balloonSolution: {
      solution: IMSolutionLitePlain,
      user: IMCompetitionUserLite,
      problem: BalloonProblemConfig,
      isFb: boolean
    }[] = []
    for (const [index, config] of problemConfig.rows.entries()) {
      problem[config.problemId] = {
        index,
        config,
        solutions: []
      }
    }
    // 获取当前比赛的用户信息
    const allUser = await this.competitionService.getCompetitionUsers(competitionId)
    const userConfig: Record<number, IMCompetitionUserLite> = {}
    for (const usr of allUser.rows) {
      userConfig[usr.userId] = usr
    }

    // 获取当前比赛的提交记录
    const solutions = await this.solutionService.getAllCompetitionSolutionList(competitionId)
    // 顺序判断提交，直到遇到没出结果的提交为止
    for (const solution of solutions) {
      if (!userConfig[solution.userId]) {
        continue
      }
      if (solution.result === 0 || solution.result > 8) {
        break
      }
      // AC
      if (solution.result === 1) {
        const problemConf = problem[solution.problemId]
        if (!problemConf) {
          continue
        }

        // 不重复计算同一个人的后续 ac
        let submitted = false
        for (const slu of problemConf.solutions) {
          if (slu.userId === solution.userId) {
            submitted = true
            break
          }
        }
        if (submitted) {
          continue
        }

        balloonSolution.push({
          solution,
          user: userConfig[solution.userId],
          problem: problemConf,
          isFb: problemConf.solutions.length === 0
        })
        problemConf.solutions.push(solution)
      }
    }

    // 获取已有的气球数据
    const balloonsRes = await this.getAllBalloonsByCompetitionId(competitionId)

    // userId-problemId-isFb
    const oldStr: string[] = []
    const newStr: string[] = []
    for (const elem of balloonsRes) {
      const str = `${elem.userId}-${elem.problemId}-${elem.isFb}`
      // 移除回撤的数据
      if (elem.type === 2) {
        const idx = oldStr.indexOf(`${elem.userId}-${elem.problemId}-true`)
        if (idx > -1) {
          oldStr.slice(idx, 1)
        }
        const idx1 = oldStr.indexOf(`${elem.userId}-${elem.problemId}-false`)
        if (idx1 > -1) {
          oldStr.slice(idx1, 1)
        }
      }
      oldStr.push(str)
    }
    for (const elem of balloonSolution) {
      const str = `${elem.user.userId}-${elem.problem.config.problemId}-${elem.isFb}`
      newStr.push(str)
    }
    // diff
    const needInsert = newStr.filter(elem => !oldStr.includes(elem))
    const needRevoke = oldStr.filter(elem => !newStr.includes(elem))

    // 新增的直接创建
    for (const str of needInsert) {
      const [userIdStr, problemIdStr, isFbStr] = str.split('-')
      const userId = Number(userIdStr)
      const problemId = Number(problemIdStr)
      const isFb = isFbStr === 'true'
      const solution = solutions.find(elem => elem.userId === userId && elem.problemId === problemId)
      await this.model.create({
        competitionId,
        userId,
        problemId,
        isFb,
        problemIndex: problem[problemId].index,
        type: 1,
        status: 1,
        solutionId: solution!.solutionId,
        balloonAlias: problem[problemId].config.balloonAlias,
        balloonColor: problem[problemId].config.balloonColor,
        nickname: userConfig[userId].info.nickname,
        fieldShortName: userConfig[userId].fieldShortName,
        seatNo: userConfig[userId].seatNo,
        subname: userConfig[userId].info.subname
      })
    }

    // 需要回撤的更新状态
    for (const str of needRevoke) {
      const [userIdStr, problemIdStr, _] = str.split('-')
      const userId = Number(userIdStr)
      const problemId = Number(problemIdStr)
      this.model.update({
        type: 2,
        status: 1
      }, {
        where: {
          userId,
          problemId
        }
      })
    }

    const res = await this.getAllBalloonsByCompetitionId(competitionId)
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
      .then((r) => r.map((d) => d.get({plain: true}) as IMBalloonLite));
  }
}
