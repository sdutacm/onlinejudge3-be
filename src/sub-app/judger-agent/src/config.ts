const pulsarHost = process.env.PULSAR_HOST || '127.0.0.1';
const pulsarPort = parseInt(process.env.PULSAR_PORT!, 10) || 6650;
const pulsarApiBase = process.env.PULSAR_API_BASE || 'http://127.0.0.1:8080';
const pulsarTenant = process.env.PULSAR_TENANT || 'public';
const pulsarNamespace = process.env.PULSAR_NAMESPACE || 'oj';
const pulsarAuthToken = process.env.PULSAR_AUTH_TOKEN || '';

const ojApiBaseUrl = process.env.OJ_API_BASE_URL || 'http://127.0.0.1:7001';
const ojApiSystemAuthKey = process.env.OJ_API_SYSTEM_AUTH_KEY || '';

const judgerDataDir = process.env.JUDGER_DATA_DIR || '/judger-data';
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
  oj: {
    apiBaseUrl: ojApiBaseUrl,
    apiSystemAuthKey: ojApiSystemAuthKey,
  },
  judgerData: {
    dataDir: judgerDataDir,
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
