import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => achievementContract;
providerWrapper([
  {
    id: 'achievementContract',
    provider: factory,
  },
]);

const achievementContract = {
  getAchievementRateResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            hashKey: { type: 'string' },
            count: { type: 'number' },
            rate: { type: 'number' },
          },
          additionalProperties: false,
          required: ['hashKey', 'count', 'rate'],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,
};

export type IAchievementContract = typeof achievementContract;
export default achievementContract;
