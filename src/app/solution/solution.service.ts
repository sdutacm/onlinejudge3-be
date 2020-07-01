import { provide, inject, Context, config } from 'midway';
import { CSolutionMeta } from './solution.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TSolutionModel } from '@/lib/models/solution.model';
import { TMSolutionLiteFields, TMSolutionDetailFields } from './solution.interface';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';

export type CSolutionService = SolutionService;

const solutionLiteFields: Array<TMSolutionLiteFields> = [
  'solutionId',
  'userId',
  'problemId',
  'contestId',
  'result',
  'time',
  'memory',
  'language',
  'codeLength',
  'shared',
  'createdAt',
];

const solutionDetailFields: Array<TMSolutionDetailFields> = [
  'solutionId',
  'userId',
  'problemId',
  'contestId',
  'result',
  'time',
  'memory',
  'language',
  'codeLength',
  'shared',
  'createdAt',
];

@provide()
export default class SolutionService {
  @inject('solutionMeta')
  meta: CSolutionMeta;

  @inject('solutionModel')
  model: TSolutionModel;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @inject()
  lodash: ILodash;

  @config()
  redisKey: IRedisKeyConfig;

  @config()
  durations: IDurationsConfig;
}
