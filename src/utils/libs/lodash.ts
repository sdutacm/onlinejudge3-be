import { providerWrapper } from 'midway';
import {
  isEqual,
  cloneDeep,
  uniq,
  uniqBy,
  random,
  pick,
  omit,
  difference,
  chunk,
  floor,
  ceil,
  round,
} from 'lodash';

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
  uniqBy,
  random,
  pick,
  omit,
  difference,
  chunk,
  floor,
  ceil,
  round,
};
export default lodash;
export type ILodash = typeof lodash;
