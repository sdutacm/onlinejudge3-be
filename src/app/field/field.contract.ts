import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';

export const factory = () => fieldContract;
providerWrapper([
  {
    id: 'fieldContract',
    provider: factory,
  },
]);

const fieldContract = {
  getFieldListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['fieldId', 'createdAt', 'updatedAt'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      fieldId: { type: 'number', minimum: 1 },
      name: { type: 'string' },
      shortName: { type: 'string' },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getFieldListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            fieldId: { type: 'number' },
            name: { type: 'string' },
            shortName: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
            updatedAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
          },
          additionalProperties: false,
          required: ['fieldId', 'name', 'shortName', 'createdAt', 'updatedAt'],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,

  getFieldDetailReq: {
    properties: {
      fieldId: { type: 'number', minimum: 1 },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
    required: ['fieldId'],
  } as defContract.ContractSchema,

  getFieldDetailResp: {
    properties: {
      fieldId: { type: 'number' },
      name: { type: 'string' },
      shortName: { type: 'string' },
      seatingArrangement: {
        anyOf: [
          {
            type: 'object',
            properties: {
              seatMap: {
                type: 'object',
                properties: {
                  row: { type: 'number' },
                  col: { type: 'number' },
                  arrangement: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        anyOf: [{ type: 'number' }, { type: 'null' }],
                      },
                    },
                  },
                },
                additionalProperties: false,
                required: ['row', 'col', 'arrangement'],
              },
              seats: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    seatNo: { type: 'number' },
                    boundIp: { type: 'string' },
                    disabled: { type: 'boolean' },
                  },
                  additionalProperties: false,
                  required: ['seatNo'],
                },
              },
            },
            additionalProperties: false,
            required: ['seatMap', 'seats'],
          },
          { type: 'null' },
        ],
      },
      createdAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
      updatedAt: { type: 'string', format: 'date-time', description: 'YYYY-MM-DD HH:mm:ss' },
    },
    additionalProperties: false,
    required: ['fieldId', 'name', 'shortName', 'createdAt', 'updatedAt'],
  } as defContract.ContractSchema,

  createFieldReq: {
    properties: {
      name: { type: 'string', maxLength: 64 },
      shortName: { type: 'string', minLength: 1, maxLength: 8, pattern: '^[A-Z0-9]*$' },
    },
    additionalProperties: false,
    required: ['name', 'shortName'],
  } as defContract.ContractSchema,

  createFieldResp: {
    properties: {
      fieldId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['fieldId'],
  } as defContract.ContractSchema,

  updateFieldDetailReq: {
    properties: {
      fieldId: { type: 'number', minimum: 1 },
      name: { type: 'string', maxLength: 64 },
      shortName: { type: 'string', minLength: 1, maxLength: 8, pattern: '^[A-Z0-9]*$' },
      seatingArrangement: {
        type: 'object',
        properties: {
          seatMap: {
            type: 'object',
            properties: {
              row: { type: 'number' },
              col: { type: 'number' },
              arrangement: {
                type: 'array',
                items: {
                  type: 'array',
                  items: {
                    anyOf: [{ type: 'number' }, { type: 'null' }],
                  },
                },
              },
            },
            additionalProperties: false,
            required: ['row', 'col', 'arrangement'],
          },
          seats: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                seatNo: { type: 'number' },
                boundIp: { type: 'string' },
                disabled: { type: 'boolean' },
              },
              additionalProperties: false,
              required: ['seatNo'],
            },
          },
        },
        additionalProperties: false,
        required: ['seatMap', 'seats'],
      },
      deleted: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['fieldId'],
  } as defContract.ContractSchema,
};

export type IFieldContract = typeof fieldContract;
export default fieldContract;
