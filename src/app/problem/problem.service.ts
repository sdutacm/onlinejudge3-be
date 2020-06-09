import { provide, inject, Context, config } from 'midway';
import { CProblemMeta } from './problem.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TProblemModel } from '@/lib/models/problem.model';
import { TMProblemLiteFields, TMProblemDetailFields, IMProblemDetail } from './problem.interface';

export type CProblemService = ProblemService;

const problemLiteFields: Array<TMProblemLiteFields> = [
  'problemId',
  'title',
  'source',
  'author',
  'difficulty',
  'createdAt',
  'updatedAt',
  'accepted',
  'submitted',
];
const problemDetailFields: Array<TMProblemDetailFields> = [
  'problemId',
  'title',
  'description',
  'input',
  'output',
  'sampleInput',
  'sampleOutput',
  'hint',
  'source',
  'author',
  'timeLimit',
  'memoryLimit',
  'difficulty',
  'createdAt',
  'updatedAt',
  'accepted',
  'submitted',
  'spj',
  'display',
];

@provide()
export default class ProblemService {
  @inject('problemMeta')
  meta: CProblemMeta;

  @inject('problemModel')
  model: TProblemModel;

  @inject()
  ctx: Context;

  @config()
  redisKey: IRedisKeyConfig;

  @config('durations')
  durations: IDurationsConfig;
}
