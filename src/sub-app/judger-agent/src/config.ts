const mysqlHost = process.env.MYSQL_HOST || '127.0.0.1';
const mysqlPort = parseInt(process.env.MYSQL_PORT!, 10) || 3306;
const mysqlUser = process.env.MYSQL_USER || 'blue';
const mysqlPassword = process.env.MYSQL_PASSWORD || '';
const mysqlDatabase = process.env.MYSQL_DB || 'oj';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT!, 10) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;
const redisDb = parseInt(process.env.REDIS_DB!, 10) || 0;

const pulsarHost = process.env.PULSAR_HOST || '127.0.0.1';
const pulsarPort = parseInt(process.env.PULSAR_PORT!, 10) || 6650;
const pulsarApiBase = process.env.PULSAR_API_BASE || 'http://127.0.0.1:8080';
const pulsarTenant = process.env.PULSAR_TENANT || 'public';
const pulsarNamespace = process.env.PULSAR_NAMESPACE || 'oj';
const pulsarAuthToken = process.env.PULSAR_AUTH_TOKEN || '';

const judgerGrpcAddress = process.env.JUDGER_GRPC_ADDRESS || 'ipv4:127.0.0.1:4003';
const judgerSocketBridgeBaseUrl =
  process.env.JUDGER_SOCKET_BRIDGE_BASE_URL || 'http://127.0.0.1:7002/socketBridge';
const judgerSocketBridgeEmitAuthKey = process.env.JUDGER_SOCKET_BRIDGE_EMIT_AUTH_KEY || '';

const cdn = {
  provider: 'TencentCloud',
  /**
   * @example 'https://example.cdn.com'
   */
  cdnOrigin: process.env.CDN_DATA_BASE_URL,
  auth: {
    useAuth: process.env.CDN_TENCENT_USE_AUTH === '1',
    mode: 'TypeD',
    algorithm: process.env.CDN_TENCENT_AUTH_ALGORITHM || 'sha256',
    pkey: process.env.CDN_TENCENT_AUTH_PKEY,
    signParam: process.env.CDN_TENCENT_AUTH_SIGN_PARAM || 'sign',
    timestampParam: process.env.CDN_TENCENT_AUTH_TIMESTAMP_PARAM || 't',
    timestampRadix: parseInt(process.env.CDN_TENCENT_AUTH_TIMESTAMP_RADIX || '10', 10),
  },
};

const config = {
  mysql: {
    host: mysqlHost,
    port: mysqlPort,
    username: mysqlUser,
    password: mysqlPassword,
    database: mysqlDatabase,
  },
  redis: {
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    db: redisDb,
  },
  redisKey: {
    judgeStatus: 'status:judge_status:%d',
    solutionDetail: 'cache:solution_detail:%d',
    solutionJudgeInfo: 'cache:solution_judge_info:%d',
    asyncSolutionProblemStatsTasks: 'async:solution_problem_stats_tasks',
    asyncSolutionUserStatsTasks: 'async:solution_user_stats_tasks',
  },
  pulsar: {
    serviceUrl: `pulsar://${pulsarHost}:${pulsarPort}`,
    authenticationToken: pulsarAuthToken,
    apiBase: pulsarApiBase,
    tenant: pulsarTenant,
    namespace: pulsarNamespace,
    judgeQueueTopic: 'judge-queue',
    judgeDeadTopic: 'judge-dead-queue',
    judgeSubscription: 'judge-subscription',
    judgeDeadSubscription: 'judge-dead-subscription',
  },
  judgerGrpc: {
    address: judgerGrpcAddress,
  },
  judgerSocketBridge: {
    baseUrl: judgerSocketBridgeBaseUrl,
    emitAuthKey: judgerSocketBridgeEmitAuthKey,
  },
  cdn,
};

export default config;
