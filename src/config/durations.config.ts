const durations = {
  cacheDetail: 86400, // s
  cacheDetailNull: 10, // s
  emailVerificationCodeExpires: 86400, // s
  emailVerificationCodeRetryAfter: 60, // s
};

export default durations;
export type IDurationsConfig = typeof durations;
