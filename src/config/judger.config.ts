import path from 'path';

const judgerConfig = {
  /** 评测数据所在目录 */
  dataPath: path.join(__dirname, '../../judger-data_test'),
  /** 是否使用 git */
  dataUsingGit: false,
  /** git 分支 */
  dataGitBranch: 'master',
  /** git commit 用户名 */
  dataGitUser: 'sdutacm',
  /** git commit 邮箱 */
  dataGitEmail: 'sdutacm@example.com',
  /** @deprecated */
  languages: ['gcc', 'g++', 'java', 'python2', 'python3', 'c#'],
  /** 评测机地址 */
  address: 'ipv4:127.0.0.1:4003',
  socketBridgeBaseUrl: 'http://127.0.0.1:7002/socketBridge',
};

export default judgerConfig;
export type IJudgerConfig = typeof judgerConfig;
