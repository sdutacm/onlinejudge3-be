import path from 'path';

const judgerConfig = {
  dataPath: path.join(__dirname, '../../judger-data_test'),
  dataUsingGit: true,
  dataGitBranch: 'master',
  dataGitUser: 'sdutacm',
  dataGitEmail: 'sdutacm@163.com',
  languages: ['gcc', 'g++', 'java', 'python2', 'python3', 'c#'],
  address: 'ipv4:119.23.50.74:4003',
  socketBridgeBaseUrl: 'http://127.0.0.1:7002/socketBridge',
};

export default judgerConfig;
export type IJudgerConfig = typeof judgerConfig;
