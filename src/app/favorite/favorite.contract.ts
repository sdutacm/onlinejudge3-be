import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => favoriteContract;
providerWrapper([
  {
    id: 'favoriteContract',
    provider: factory,
  },
]);

const favoriteContract = {
  getFavoriteListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['favoriteId'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      type: { type: 'string' },
      note: { type: 'string' },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getFavoriteListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          anyOf: [
            {
              type: 'object',
              properties: {
                favoriteId: { type: 'number' },
                type: { type: 'string', enum: ['problem'] },
                target: {
                  type: 'object',
                  properties: {
                    problemId: { type: 'number' },
                    title: { type: 'string' },
                  },
                  additionalProperties: false,
                  required: ['problemId', 'title'],
                },
                note: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deleted: { type: 'boolean' },
              },
              additionalProperties: false,
              required: [
                'favoriteId',
                'type',
                'target',
                'note',
                'createdAt',
                'updatedAt',
                'deleted',
              ],
            },
            {
              type: 'object',
              properties: {
                favoriteId: { type: 'number' },
                type: { type: 'string', enum: ['contest'] },
                target: {
                  type: 'object',
                  properties: {
                    contestId: { type: 'number' },
                    title: { type: 'string' },
                  },
                  additionalProperties: false,
                  required: ['contestId', 'title'],
                },
                note: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deleted: { type: 'boolean' },
              },
              additionalProperties: false,
              required: [
                'favoriteId',
                'type',
                'target',
                'note',
                'createdAt',
                'updatedAt',
                'deleted',
              ],
            },
            {
              type: 'object',
              properties: {
                favoriteId: { type: 'number' },
                type: { type: 'string', enum: ['set'] },
                target: {
                  type: 'object',
                  properties: {
                    setId: { type: 'number' },
                    title: { type: 'string' },
                  },
                  additionalProperties: false,
                  required: ['setId', 'title'],
                },
                note: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deleted: { type: 'boolean' },
              },
              additionalProperties: false,
              required: [
                'favoriteId',
                'type',
                'target',
                'note',
                'createdAt',
                'updatedAt',
                'deleted',
              ],
            },
            {
              type: 'object',
              properties: {
                favoriteId: { type: 'number' },
                type: { type: 'string', enum: ['group'] },
                target: {
                  type: 'object',
                  properties: {
                    groupId: { type: 'number' },
                    title: { type: 'string' },
                    name: { type: 'string' },
                    verified: { type: 'boolean' },
                  },
                  additionalProperties: false,
                  required: ['groupId', 'title', 'name', 'verified'],
                },
                note: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deleted: { type: 'boolean' },
              },
              additionalProperties: false,
              required: [
                'favoriteId',
                'type',
                'target',
                'note',
                'createdAt',
                'updatedAt',
                'deleted',
              ],
            },
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,
};

export type IFavoriteContract = typeof favoriteContract;
export default favoriteContract;
