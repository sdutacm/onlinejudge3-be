import path from 'path';

const judgerConfig = {
  dataPath: path.join(__dirname, '../../judger-data_test'),
  dataGitBranch: 'master',
  dataGitUser: 'sdutacm',
  dataGitEmail: 'sdutacm@163.com',
  languages: ['gcc', 'g++', 'java', 'python2', 'python3', 'c#'],
};

export default judgerConfig;
export type IJudgerConfig = typeof judgerConfig;
