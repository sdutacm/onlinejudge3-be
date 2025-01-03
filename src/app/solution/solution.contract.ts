import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => solutionContract;
providerWrapper([
  {
    id: 'solutionContract',
    provider: factory,
  },
]);

const solutionContract = {
  getSolutionListReq: {
    properties: {
      // page: { type: 'number', minimum: 1 },
      lt: { anyOf: [{ type: 'number', minimum: 1 }, { type: 'null' }] },
      gt: { type: 'number', minimum: 0 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['solutionId', 'time', 'memory'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      solutionId: { type: 'number', minimum: 1 },
      solutionIds: { type: 'array', items: { type: 'number', minimum: 1 } },
      problemId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
      contestId: { type: 'number', minimum: 1 },
      competitionId: { type: 'number', minimum: 1 },
      result: { type: 'number' },
      language: { type: 'string' },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getSolutionListResp: {
    properties: {
      lt: { anyOf: [{ type: 'number' }, { type: 'null' }] },
      gt: { type: 'number' },
      limit: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            solutionId: { type: 'number' },
            problem: {
              type: 'object',
              properties: {
                problemId: { type: 'number' },
                title: { type: 'string' },
                timeLimit: { type: 'number' },
                memoryLimit: { type: 'number' },
                spj: { type: 'boolean' },
                spConfig: { type: 'object' },
                revision: { type: 'number' },
              },
              additionalProperties: false,
              required: ['problemId', 'timeLimit', 'memoryLimit', 'spj'],
            },
            user: {
              type: 'object',
              properties: {
                userId: { type: 'number' },
                username: { type: 'string' },
                nickname: { type: 'string' },
                avatar: { type: ['string', 'null'] },
                bannerImage: { type: 'string' },
                rating: { type: 'number' },
                type: { type: 'number' },
              },
              additionalProperties: false,
              required: ['userId', 'username', 'nickname', 'avatar', 'bannerImage', 'rating'],
            },
            contest: {
              type: 'object',
              properties: {
                contestId: { type: 'number' },
                title: { type: 'string' },
                type: { type: 'number' },
                startAt: { type: 'string', format: 'date-time' },
                endAt: { type: 'string', format: 'date-time' },
                ended: { type: 'boolean' },
                frozenLength: { type: 'number' },
              },
              additionalProperties: false,
              required: ['contestId', 'title', 'type', 'startAt', 'endAt', 'ended', 'frozenLength'],
            },
            competition: {
              type: 'object',
              properties: {
                competitionId: { type: 'number' },
                title: { type: 'string' },
                rule: { type: 'string' },
                isTeam: { type: 'boolean' },
                isRating: { type: 'boolean' },
                ended: { type: 'boolean' },
                startAt: { type: 'string', format: 'date-time' },
                endAt: { type: 'string', format: 'date-time' },
                settings: {
                  type: 'object',
                  properties: {
                    frozenLength: { type: 'number' },
                    allowedJoinMethods: { type: 'array', items: { type: 'string' } },
                    allowedAuthMethods: { type: 'array', items: { type: 'string' } },
                    allowAnyObservation: { type: 'boolean' },
                    useOnetimePassword: { type: 'boolean' },
                    allowedSolutionLanguages: { type: 'array', items: { type: 'string' } },
                    externalRanklistUrl: { type: 'string' },
                  },
                  additionalProperties: false,
                  required: [
                    'frozenLength',
                    'allowedJoinMethods',
                    'allowedAuthMethods',
                    'allowedSolutionLanguages',
                    'allowAnyObservation',
                    'useOnetimePassword',
                    'externalRanklistUrl',
                  ],
                },
              },
              additionalProperties: false,
              required: [
                'competitionId',
                'title',
                'rule',
                'isTeam',
                'isRating',
                'ended',
                'startAt',
                'endAt',
                'settings',
              ],
            },
            result: { type: 'number' },
            time: { type: 'number' },
            memory: { type: 'number' },
            language: { type: 'string' },
            codeLength: { type: 'number' },
            shared: { type: 'boolean' },
            isContestUser: { type: 'boolean' },
            judgeInfo: {
              type: 'object',
              properties: {
                problemRevision: { anyOf: [{ type: 'number' }, { type: 'null' }] },
                result: { type: 'number' },
                time: { type: 'number' },
                memory: { type: 'number' },
                lastCase: { type: 'number' },
                totalCase: { type: 'number' },
                detail: {
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        cases: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              result: { type: 'number' },
                              time: { type: 'number' },
                              memory: { type: 'number' },
                              errMsg: { type: 'string' },
                              outMsg: { type: 'string' },
                            },
                            additionalProperties: false,
                            required: ['result', 'time', 'memory'],
                          },
                        },
                      },
                      additionalProperties: false,
                      required: ['cases'],
                    },
                    { type: 'null' },
                  ],
                },
                createdAt: { type: 'string', format: 'date-time' },
                finishedAt: {
                  anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
                },
              },
              additionalProperties: false,
              required: [
                'result',
                'time',
                'memory',
                'lastCase',
                'totalCase',
                'detail',
                'createdAt',
                'finishedAt',
              ],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
          additionalProperties: false,
          required: [
            'solutionId',
            'problem',
            'user',
            'result',
            'language',
            'shared',
            'isContestUser',
            'createdAt',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['limit', 'rows'],
  } as defContract.ContractSchema,

  getSolutionDetailReq: {
    properties: {
      solutionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['solutionId'],
  } as defContract.ContractSchema,

  getSolutionDetailResp: {
    properties: {
      solutionId: { type: 'number' },
      problem: {
        type: 'object',
        properties: {
          problemId: { type: 'number' },
          title: { type: 'string' },
          timeLimit: { type: 'number' },
          memoryLimit: { type: 'number' },
          spj: { type: 'boolean' },
          spConfig: { type: 'object' },
          revision: { type: 'number' },
        },
        additionalProperties: false,
        required: ['problemId', 'timeLimit', 'memoryLimit', 'spj'],
      },
      user: {
        type: 'object',
        properties: {
          userId: { type: 'number' },
          username: { type: 'string' },
          nickname: { type: 'string' },
          avatar: { type: ['string', 'null'] },
          bannerImage: { type: 'string' },
          rating: { type: 'number' },
          type: { type: 'number' },
        },
        additionalProperties: false,
        required: ['userId', 'username', 'nickname', 'avatar', 'bannerImage', 'rating'],
      },
      contest: {
        type: 'object',
        properties: {
          contestId: { type: 'number' },
          title: { type: 'string' },
          type: { type: 'number' },
          startAt: { type: 'string', format: 'date-time' },
          endAt: { type: 'string', format: 'date-time' },
          ended: { type: 'boolean' },
          frozenLength: { type: 'number' },
        },
        additionalProperties: false,
        required: ['contestId', 'title', 'type', 'startAt', 'endAt', 'ended', 'frozenLength'],
      },
      competition: {
        type: 'object',
        properties: {
          competitionId: { type: 'number' },
          title: { type: 'string' },
          rule: { type: 'string' },
          isTeam: { type: 'boolean' },
          isRating: { type: 'boolean' },
          ended: { type: 'boolean' },
          startAt: { type: 'string', format: 'date-time' },
          endAt: { type: 'string', format: 'date-time' },
          settings: {
            type: 'object',
            properties: {
              frozenLength: { type: 'number' },
              allowedJoinMethods: { type: 'array', items: { type: 'string' } },
              allowedAuthMethods: { type: 'array', items: { type: 'string' } },
              allowedSolutionLanguages: { type: 'array', items: { type: 'string' } },
              allowAnyObservation: { type: 'boolean' },
              useOnetimePassword: { type: 'boolean' },
              externalRanklistUrl: { type: 'string' },
            },
            additionalProperties: false,
            required: [
              'frozenLength',
              'allowedJoinMethods',
              'allowedAuthMethods',
              'allowedSolutionLanguages',
              'allowAnyObservation',
              'useOnetimePassword',
              'externalRanklistUrl',
            ],
          },
        },
        additionalProperties: false,
        required: [
          'competitionId',
          'title',
          'rule',
          'isTeam',
          'isRating',
          'ended',
          'startAt',
          'endAt',
          'settings',
        ],
      },
      result: { type: 'number' },
      time: { type: 'number' },
      memory: { type: 'number' },
      language: { type: 'string' },
      codeLength: { type: 'number' },
      compileInfo: { type: 'string' },
      code: { type: 'string' },
      shared: { type: 'boolean' },
      isContestUser: { type: 'boolean' },
      judgeInfo: {
        type: 'object',
        properties: {
          problemRevision: { anyOf: [{ type: 'number' }, { type: 'null' }] },
          result: { type: 'number' },
          time: { type: 'number' },
          memory: { type: 'number' },
          lastCase: { type: 'number' },
          totalCase: { type: 'number' },
          detail: {
            anyOf: [
              {
                type: 'object',
                properties: {
                  cases: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        result: { type: 'number' },
                        time: { type: 'number' },
                        memory: { type: 'number' },
                        errMsg: { type: 'string' },
                        outMsg: { type: 'string' },
                      },
                      additionalProperties: false,
                      required: ['result', 'time', 'memory'],
                    },
                  },
                },
                additionalProperties: false,
                required: ['cases'],
              },
              { type: 'null' },
            ],
          },
          createdAt: { type: 'string', format: 'date-time' },
          finishedAt: {
            anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
          },
        },
        additionalProperties: false,
        required: [
          'result',
          'time',
          'memory',
          'lastCase',
          'totalCase',
          'detail',
          'createdAt',
          'finishedAt',
        ],
      },
      createdAt: { type: 'string', format: 'date-time' },
    },
    additionalProperties: false,
    required: [
      'solutionId',
      'problem',
      'user',
      'result',
      // 'time',
      // 'memory',
      'language',
      // 'codeLength',
      // 'compileInfo',
      // 'code',
      'shared',
      'isContestUser',
      'createdAt',
    ],
  } as defContract.ContractSchema,

  batchGetSolutionDetailReq: {
    properties: {
      solutionIds: {
        type: 'array',
        items: { type: 'number', minimum: 1 },
      },
    },
    additionalProperties: false,
    required: ['solutionIds'],
  } as defContract.ContractSchema,

  batchGetSolutionDetailResp: {
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        solutionId: { type: 'number' },
        problem: {
          type: 'object',
          properties: {
            problemId: { type: 'number' },
            title: { type: 'string' },
            timeLimit: { type: 'number' },
            memoryLimit: { type: 'number' },
            spj: { type: 'boolean' },
            spConfig: { type: 'object' },
            revision: { type: 'number' },
          },
          additionalProperties: false,
          required: ['problemId', 'timeLimit', 'memoryLimit', 'spj'],
        },
        user: {
          type: 'object',
          properties: {
            userId: { type: 'number' },
            username: { type: 'string' },
            nickname: { type: 'string' },
            avatar: { type: ['string', 'null'] },
            bannerImage: { type: 'string' },
            rating: { type: 'number' },
            type: { type: 'number' },
          },
          additionalProperties: false,
          required: ['userId', 'username', 'nickname', 'avatar', 'bannerImage', 'rating'],
        },
        contest: {
          type: 'object',
          properties: {
            contestId: { type: 'number' },
            title: { type: 'string' },
            type: { type: 'number' },
            startAt: { type: 'string', format: 'date-time' },
            endAt: { type: 'string', format: 'date-time' },
            ended: { type: 'boolean' },
            frozenLength: { type: 'number' },
          },
          additionalProperties: false,
          required: ['contestId', 'title', 'type', 'startAt', 'endAt', 'ended', 'frozenLength'],
        },
        competition: {
          type: 'object',
          properties: {
            competitionId: { type: 'number' },
            title: { type: 'string' },
            rule: { type: 'string' },
            isTeam: { type: 'boolean' },
            isRating: { type: 'boolean' },
            ended: { type: 'boolean' },
            startAt: { type: 'string', format: 'date-time' },
            endAt: { type: 'string', format: 'date-time' },
            settings: {
              type: 'object',
              properties: {
                frozenLength: { type: 'number' },
                allowedJoinMethods: { type: 'array', items: { type: 'string' } },
                allowedAuthMethods: { type: 'array', items: { type: 'string' } },
                allowedSolutionLanguages: { type: 'array', items: { type: 'string' } },
                allowAnyObservation: { type: 'boolean' },
                useOnetimePassword: { type: 'boolean' },
                externalRanklistUrl: { type: 'string' },
              },
              additionalProperties: false,
              required: [
                'frozenLength',
                'allowedJoinMethods',
                'allowedAuthMethods',
                'allowedSolutionLanguages',
                'allowAnyObservation',
                'useOnetimePassword',
                'externalRanklistUrl',
              ],
            },
          },
          additionalProperties: false,
          required: [
            'competitionId',
            'title',
            'rule',
            'isTeam',
            'isRating',
            'ended',
            'startAt',
            'endAt',
            'settings',
          ],
        },
        result: { type: 'number' },
        time: { type: 'number' },
        memory: { type: 'number' },
        language: { type: 'string' },
        codeLength: { type: 'number' },
        compileInfo: { type: 'string' },
        code: { type: 'string' },
        shared: { type: 'boolean' },
        isContestUser: { type: 'boolean' },
        judgeInfo: {
          type: 'object',
          properties: {
            problemRevision: { anyOf: [{ type: 'number' }, { type: 'null' }] },
            result: { type: 'number' },
            time: { type: 'number' },
            memory: { type: 'number' },
            lastCase: { type: 'number' },
            totalCase: { type: 'number' },
            detail: {
              anyOf: [
                {
                  type: 'object',
                  properties: {
                    cases: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          result: { type: 'number' },
                          time: { type: 'number' },
                          memory: { type: 'number' },
                          errMsg: { type: 'string' },
                          outMsg: { type: 'string' },
                        },
                        additionalProperties: false,
                        required: ['result', 'time', 'memory'],
                      },
                    },
                  },
                  additionalProperties: false,
                  required: ['cases'],
                },
                { type: 'null' },
              ],
            },
            createdAt: { type: 'string', format: 'date-time' },
            finishedAt: {
              anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            },
          },
          additionalProperties: false,
          required: [
            'result',
            'time',
            'memory',
            'lastCase',
            'totalCase',
            'detail',
            'createdAt',
            'finishedAt',
          ],
        },
        createdAt: { type: 'string', format: 'date-time' },
      },
      additionalProperties: false,
      required: [
        'solutionId',
        'problem',
        'user',
        'result',
        // 'time',
        // 'memory',
        'language',
        // 'codeLength',
        // 'compileInfo',
        // 'code',
        'shared',
        'isContestUser',
        'createdAt',
      ],
    },
  } as defContract.ContractSchema,

  updateSolutionShareReq: {
    properties: {
      solutionId: { type: 'number', minimum: 1 },
      shared: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['solutionId', 'shared'],
  } as defContract.ContractSchema,

  submitSolutionReq: {
    properties: {
      problemId: { type: 'number', minimum: 1 },
      contestId: { type: 'number', minimum: 1 },
      competitionId: { type: 'number', minimum: 1 },
      language: { type: 'string' },
      codeFormat: { type: 'string', enum: ['raw', 'base64'] },
      code: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
    required: ['problemId', 'language', 'code'],
  } as defContract.ContractSchema,

  submitSolutionResp: {
    properties: {
      solutionId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['solutionId'],
  } as defContract.ContractSchema,

  rejudgeSolutionReq: {
    properties: {
      solutionId: { type: 'number', minimum: 1 },
      problemId: { type: 'number', minimum: 1 },
      userId: { type: 'number', minimum: 1 },
      contestId: { type: 'number', minimum: 1 },
      competitionId: { type: 'number', minimum: 1 },
      result: { type: 'number' },
    },
    additionalProperties: false,
    required: [],
  } as defContract.ContractSchema,

  rejudgeSolutionResp: {
    properties: {
      rejudgedCount: { type: 'number' },
    },
    additionalProperties: false,
    required: ['rejudgedCount'],
  } as defContract.ContractSchema,

  callbackJudgeReq: {
    properties: {
      judgeInfoId: { type: 'number' },
      solutionId: { type: 'number' },
      judgerId: { type: 'string' },
      userId: { type: 'number' },
      problemId: { type: 'number' },
      contestId: { type: 'number' },
      competitionId: { type: 'number' },
      data: {
        anyOf: [
          {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['start'] },
            },
            additionalProperties: false,
            required: ['type'],
          },
          {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['progress'] },
              current: { type: 'number' },
              total: { type: 'number' },
            },
            additionalProperties: false,
            required: ['type', 'current', 'total'],
          },
          {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['finish'] },
              resultType: {
                type: 'string',
                enum: ['CompileError', 'SystemError', 'Done'],
              },
              detail: {
                type: 'object',
                allowAdditionalProperties: true,
              },
            },
            additionalProperties: false,
            required: ['type', 'resultType'],
          },
        ],
      },
      eventTimestampUs: { type: 'number' },
      batchData: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            data: {
              anyOf: [
                {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['start'] },
                  },
                  additionalProperties: false,
                  required: ['type'],
                },
                {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['progress'] },
                    current: { type: 'number' },
                    total: { type: 'number' },
                  },
                  additionalProperties: false,
                  required: ['type', 'current', 'total'],
                },
                {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['finish'] },
                    resultType: {
                      type: 'string',
                      enum: ['CompileError', 'SystemError', 'Done'],
                    },
                    detail: {
                      type: 'object',
                      allowAdditionalProperties: true,
                    },
                  },
                  additionalProperties: false,
                  required: ['type', 'resultType'],
                },
              ],
            },
            eventTimestampUs: { type: 'number' },
          },
          additionalProperties: false,
          required: ['data', 'eventTimestampUs'],
        },
      },
    },
    additionalProperties: true,
    required: ['judgeInfoId', 'solutionId', 'judgerId'],
  } as defContract.ContractSchema,
};

export type ISolutionContract = typeof solutionContract;
export default solutionContract;
