import { providerWrapper } from 'midway';
import * as misc from './misc';

export const factory = () => utils;
providerWrapper([
  {
    id: 'utils',
    provider: factory,
  },
]);

const utils = {
  misc,
};

export default utils;
export type IUtils = typeof utils;
