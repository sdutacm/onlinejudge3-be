import { providerWrapper } from 'midway';
import fs from 'fs-extra';

export const factory = () => fs;
providerWrapper([
  {
    id: 'fs',
    provider: factory,
  },
]);

export default fs;
export type IFs = typeof fs;
