import { providerWrapper } from 'midway';
import { defContract } from '@/typings/contract';
import { EGroupJoinChannel } from '../../common/enums';

export const factory = () => groupContract;
providerWrapper([
  {
    id: 'groupContract',
    provider: factory,
  },
]);

const groupContract = {
  getGroupListReq: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      order: {
        type: 'array',
        items: {
          type: 'array',
          items: [
            { type: 'string', enum: ['groupId'] },
            { type: 'string', enum: ['ASC', 'DESC'] },
          ],
          additionalItems: false,
          minItems: 2,
        },
      },
      groupId: { type: 'number', minimum: 1 },
      name: { type: 'string' },
      verified: { type: 'boolean' },
      private: { type: 'boolean' },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
  } as defContract.ContractSchema,

  getGroupListResp: {
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 0 },
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            groupId: { type: 'number' },
            name: { type: 'string' },
            avatar: { type: 'string' },
            intro: { type: 'string' },
            verified: { type: 'boolean' },
            private: { type: 'boolean' },
            joinChannel: { type: 'number' },
            membersCount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deleted: { type: 'boolean' },
          },
          additionalProperties: false,
          required: [
            'groupId',
            'name',
            'avatar',
            'intro',
            'verified',
            'private',
            'joinChannel',
            'membersCount',
            'createdAt',
            'updatedAt',
            'deleted',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['page', 'limit', 'count', 'rows'],
  } as defContract.ContractSchema,

  getGroupDetailReq: {
    properties: {
      groupId: { type: 'number', minimum: 1 },
      _scope: { anyOf: [{ type: 'string', enum: ['available'] }, { type: 'null' }] },
    },
    additionalProperties: false,
    required: ['groupId'],
  } as defContract.ContractSchema,

  getGroupDetailResp: {
    properties: {
      groupId: { type: 'number' },
      name: { type: 'string' },
      avatar: { type: 'string' },
      intro: { type: 'string' },
      verified: { type: 'boolean' },
      private: { type: 'boolean' },
      joinChannel: { type: 'number' },
      membersCount: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      deleted: { type: 'boolean' },
    },
    additionalProperties: false,
    required: [
      'groupId',
      'name',
      'avatar',
      'intro',
      'verified',
      'private',
      'joinChannel',
      'membersCount',
      'createdAt',
      'updatedAt',
      'deleted',
    ],
  } as defContract.ContractSchema,

  getUserGroupsReq: {
    properties: {
      userId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['userId'],
  } as defContract.ContractSchema,

  getUserGroupsResp: {
    properties: {
      count: { type: 'number', minimum: 0 },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            groupId: { type: 'number' },
            name: { type: 'string' },
            avatar: { type: 'string' },
            intro: { type: 'string' },
            verified: { type: 'boolean' },
            private: { type: 'boolean' },
            joinChannel: { type: 'number' },
            membersCount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deleted: { type: 'boolean' },
          },
          additionalProperties: false,
          required: [
            'groupId',
            'name',
            'avatar',
            'intro',
            'verified',
            'private',
            'joinChannel',
            'membersCount',
            'createdAt',
            'updatedAt',
            'deleted',
          ],
        },
      },
    },
    additionalProperties: false,
    required: ['count', 'rows'],
  } as defContract.ContractSchema,

  createGroupReq: {
    properties: {
      name: { type: 'string', minLength: 3, maxLength: 32 },
      intro: { type: 'string', maxLength: 100 },
      verified: { type: 'boolean' },
      private: { type: 'boolean' },
      joinChannel: {
        type: 'number',
        enum: [EGroupJoinChannel.any, EGroupJoinChannel.audit, EGroupJoinChannel.invitation],
      },
    },
    additionalProperties: false,
    required: ['name', 'intro', 'private', 'joinChannel'],
  } as defContract.ContractSchema,

  createGroupResp: {
    properties: {
      groupId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['groupId'],
  } as defContract.ContractSchema,

  createEmptyGroupReq: {
    properties: {
      name: { type: 'string', minLength: 3, maxLength: 32 },
      intro: { type: 'string', maxLength: 100 },
      verified: { type: 'boolean' },
      private: { type: 'boolean' },
    },
    additionalProperties: false,
    required: ['name', 'intro', 'private'],
  } as defContract.ContractSchema,

  createEmptyGroupResp: {
    properties: {
      groupId: { type: 'number' },
    },
    additionalProperties: false,
    required: ['groupId'],
  } as defContract.ContractSchema,

  updateGroupReq: {
    properties: {
      groupId: { type: 'number', minimum: 1 },
      name: { type: 'string', minLength: 3, maxLength: 32 },
      intro: { type: 'string', maxLength: 100 },
      verified: { type: 'boolean' },
      private: { type: 'boolean' },
      joinChannel: {
        type: 'number',
        enum: [EGroupJoinChannel.any, EGroupJoinChannel.audit, EGroupJoinChannel.invitation],
      },
    },
    additionalProperties: false,
    required: ['groupId', 'name', 'intro', 'private', 'joinChannel'],
  } as defContract.ContractSchema,

  deleteGroupReq: {
    properties: {
      groupId: { type: 'number', minimum: 1 },
    },
    additionalProperties: false,
    required: ['groupId'],
  } as defContract.ContractSchema,
};

export type IGroupContract = typeof groupContract;
export default groupContract;
