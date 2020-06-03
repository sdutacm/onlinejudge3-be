import { providerWrapper } from 'midway';
import { isEqual, cloneDeep, uniq, random } from 'lodash';

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
};
export default lodash;
export type ILodash = typeof lodash;
