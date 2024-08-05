// export const cors = {
//   enable: false,
//   package: 'egg-cors',
// }

export const redis = {
  enable: true,
  package: 'egg-redis',
};

export const sessionRedis = {
  enable: true,
  package: 'egg-session-redis',
};

export const io = {
  enable: true,
  package: 'egg-socket.io',
};

export const alinode = {
  enable: process.env.NODE_ENV !== 'development',
  package: 'egg-alinode',
};

// false 禁用全部安全检查用于临时调试
// export const security = false
