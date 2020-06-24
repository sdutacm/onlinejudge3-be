import { providerWrapper } from 'midway';
import AdmZip from 'adm-zip';

export const factory = () => AdmZip;
providerWrapper([
  {
    id: 'AdmZip',
    provider: factory,
  },
]);

export default AdmZip;
export type CAdmZip = typeof AdmZip;
