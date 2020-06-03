import { providerWrapper } from 'midway';
import * as format from './format';
import * as misc from './misc';

export const factory = () => utils;
providerWrapper([
  {
    id: 'utils',
    provider: factory,
  },
]);

const utils = {
  format,
  misc,
};

export default utils;
export type IUtils = typeof utils;
