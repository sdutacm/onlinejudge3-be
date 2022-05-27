import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => balloonContract;
providerWrapper([
  {
    id: 'balloonContract',
    provider: factory,
  },
]);

const balloonContract = {
  getCompetitionBalloonsReq: {
    properties: {
      competitionId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['competitionId'],
  } as defContract.ContractSchema,

  getCompetitionBalloonsResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            balloonId: { type: 'number' },
            solutionId: { type: 'number' },
            competitionId: { type: 'number' },
            userId: { type: 'number' },
            problemId: { type: 'number' },
            problemIndex: { type: 'number' },
            balloonAlias: { type: 'string' },
            balloonColor: { type: 'string' },
            nickname: { type: 'string' },
            subname: { type: 'string' },
            fieldShortName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            seatNo: { anyOf: [{ type: 'number' }, { type: 'null' }] },
            type: { type: 'number' },
            status: { type: 'number' },
            assignedUserId: { anyOf: [{ type: 'number' }, { type: 'null' }] },
            isFb: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
            updatedAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
          },
          additionalProperties: false,
          required: [
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
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  updateCompetitionBalloonStatusReq: {
    properties: {
      balloonId: { type: 'number', minimum: 1 },
      competitionId: { type: 'number', minimum: 1 },
      status: { type: 'number' },
      assignedUserId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['balloonId', 'competitionId'],
  } as defContract.ContractSchema,
};

export type IBalloonContract = typeof balloonContract;
export default balloonContract;
