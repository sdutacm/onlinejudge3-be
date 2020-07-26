import { IRouteBeConfig } from '@/common/routes';

const testUtils = {
  controllerDesc(routeConfig: IRouteBeConfig) {
    return `${routeConfig.method} ${routeConfig.url}`;
  },

  getMockNormalSession() {
    return {
      userId: 4,
      username: 'test',
      nickname: 'test_user',
      permission: 1,
      avatar: '',
      contests: {},
    };
  },

  getMockPermSession() {
    return {
      userId: 3,
      username: 'tianxy',
      nickname: 'tianxy',
      permission: 1,
      avatar: '',
      contests: {},
    };
  },

  getMockAdminSession() {
    return {
      userId: 1,
      username: 'root',
      nickname: 'hack',
      permission: 3,
      avatar: '',
      contests: {},
    };
  },
};

export default testUtils;
