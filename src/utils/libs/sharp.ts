import { providerWrapper } from 'midway';
import sharp from 'sharp';

export const factory = () => sharp;
providerWrapper([
  {
    id: 'sharp',
    provider: factory,
  },
]);

export default sharp;
export type ISharp = typeof sharp;
