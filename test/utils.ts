import { IRouteBeConfig } from '@/common/routes';

const testUtils = {
  controllerDesc(routeConfig: IRouteBeConfig) {
    return `${routeConfig.method} ${routeConfig.url}`;
  },
};

export default testUtils;
