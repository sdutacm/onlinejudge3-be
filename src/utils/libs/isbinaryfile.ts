import { providerWrapper } from 'midway';
import { isBinaryFile } from 'isbinaryfile';

export const factory = () => isBinaryFile;
providerWrapper([
  {
    id: 'isBinaryFile',
    provider: factory,
  },
]);

export default isBinaryFile;
export type IIsBinaryFile = typeof isBinaryFile;
