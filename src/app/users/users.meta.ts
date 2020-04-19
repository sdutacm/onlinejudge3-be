import { providerWrapper } from 'midway';

export const factory = () => userMeta;
providerWrapper([
  {
    id: 'userMeta',
    provider: factory,
  },
]);

const userMeta: defMeta.BaseMeta = {
  module: 'user',
  pk: 'userId',
};

export type IUserMeta = typeof userMeta;
