import { providerWrapper } from 'midway';
import simpleGit, { SimpleGit } from 'simple-git';

export const factory = () => simpleGit;
providerWrapper([
  {
    id: 'simpleGit',
    provider: factory,
  },
]);

export default simpleGit;
export type ISimpleGit = typeof simpleGit;
export { SimpleGit };
