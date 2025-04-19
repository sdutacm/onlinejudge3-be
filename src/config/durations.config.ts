const durations = {
  cacheDetail: 3600, // s
  cacheDetailVeryShort: 15, // s
  cacheDetailShort: 30, // s
  cacheDetailMedium: 60, // s
  cacheDetailLong: 300, // s
  cacheDetailNull: 10, // s
  cacheFullList: 7200, // s
  emailVerificationCodeExpires: 86400, // s
  emailVerificationCodeRetryAfter: 60, // s
};

export default durations;
export type IDurationsConfig = typeof durations;
