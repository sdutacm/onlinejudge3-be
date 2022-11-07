import 'tsconfig-paths/register';

// export const cors = {
//   enable: false,
//   package: 'egg-cors',
// }

export const sequelize = {
  enable: true,
  package: 'egg-sequelize',
};

export const redis = {
  enable: true,
  package: 'egg-redis',
};

export const alinode = {
  enable: process.env.NODE_ENV !== 'development',
  package: 'egg-alinode',
};

// export const io = {
//   enable: true,
//   package: 'egg-socket.io',
// };

export const sessionRedis = {
  enable: true,
  package: 'egg-session-redis',
};

// false 禁用全部安全检查用于临时调试
// export const security = false
