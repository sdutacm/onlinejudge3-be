import path from 'path';

export interface IJudgerConfig {
  /**
   * 评测数据所在目录。如有需要，可以直接 clone 测试数组到本地，然后在此指定其路径
   * @see https://github.com/sdutacm/judger-data_test
   */
  dataPath: string;
  /** 是否使用 git */
  dataUsingGit: boolean;
  /** git 分支 */
  dataGitBranch: string;
  /** git commit 用户名 */
  dataGitUser: string;
  /** git commit 邮箱 */
  dataGitEmail: string;
  /** 评测机地址 */
  address: string | undefined;
  /** 消息队列评测队列主题 */
  mqJudgeQueueTopic: string;
  /** 消息队列评测队列订阅 */
  mqJudgeQueueSubscription: string;
  /** 消息队列评测死信队列主题 */
  mqJudgeDeadQueueTopic: string;
  /** 消息队列评测死信队列订阅 */
  mqJudgeDeadQueueSubscription: string;
  /** 评测数据对象存储（腾讯云） */
  cos?: {
    secretId?: string;
    secretKey?: string;
    region: string;
    bucket: string;
  };
}

const judgerConfig: IJudgerConfig = {
  /**
   * 评测数据所在目录。如有需要，可以直接 clone 测试数组到本地，然后在此指定其路径
   * @see https://github.com/sdutacm/judger-data_test
   */
  dataPath: path.join(__dirname, '../../judger-data_test'),
  /** 是否使用 git */
  dataUsingGit: false,
  /** git 分支 */
  dataGitBranch: 'master',
  /** git commit 用户名 */
  dataGitUser: 'sdutacm',
  /** git commit 邮箱 */
  dataGitEmail: 'sdutacm@example.com',
  /** 评测机地址 */
  // address: 'ipv4:127.0.0.1:4003',
  address: undefined,
  mqJudgeQueueTopic: 'judge-queue',
  mqJudgeQueueSubscription: 'judge-subscription',
  mqJudgeDeadQueueTopic: 'judge-dead-queue',
  mqJudgeDeadQueueSubscription: 'judge-dead-subscription',
};

export default judgerConfig;
