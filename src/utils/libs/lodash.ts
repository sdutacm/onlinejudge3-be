import { providerWrapper } from 'midway';
import { isEqual, cloneDeep, uniq, random, pick, omit } from 'lodash';

export const factory = () => lodash;
providerWrapper([
  {
    id: 'lodash',
    provider: factory,
  },
]);

const lodash = {
  isEqual,
  cloneDeep,
  uniq,
  random,
  pick,
  omit,
};
export default lodash;
export type ILodash = typeof lodash;
