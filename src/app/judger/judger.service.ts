import { provide, inject, Context, config } from 'midway';
import { CJudgerMeta } from './judger.meta';
import { IMJudgerServiceGetDataFileRes } from './judger.interface';
import { IProblemModel } from '../problem/problem.interface';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import path from 'path';
import { IFs } from '@/utils/libs/fs-extra';
import { IIsBinaryFile } from '@/utils/libs/isbinaryfile';
import { CAdmZip } from '@/utils/libs/adm-zip';
import { ISimpleGit, SimpleGit } from '@/utils/libs/simple-git';
import { IJudgerConfig } from '@/config/judger.config';

export type CJudgerService = JudgerService;

@provide()
export default class JudgerService {
  @inject('tagMeta')
  meta: CJudgerMeta;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @inject()
  lodash: ILodash;

  @inject()
  fs: IFs;

  @inject()
  isBinaryFile: IIsBinaryFile;

  @inject('AdmZip')
  AdmZip: CAdmZip;

  @inject()
  simpleGit: ISimpleGit;

  @config()
  redisKey: IRedisKeyConfig;

  @config()
  durations: IDurationsConfig;

  @config('judger')
  judgerConfig: IJudgerConfig;

  git: SimpleGit;

  constructor(
    @config('judger')
    judgerConfig: IJudgerConfig,

    @inject()
    simpleGit: ISimpleGit,
  ) {
    this.git = simpleGit(judgerConfig.dataPath);
  }

  /**
   * 获取数据目录下指定路径的文件信息，对于目录，还会返回目录下文件列表。
   * @param filePath 文件路径
   */
  async getDataFile(filePath: string): Promise<IMJudgerServiceGetDataFileRes> {
    const rootPath = path.join(this.judgerConfig.dataPath, 'data');
    const targetPath = path.join(rootPath, filePath);
    if (!targetPath.startsWith(rootPath)) {
      this.ctx.logger.warn(`Blocked access "${targetPath}". (root: "${rootPath}")`);
      return null;
    }
    console.log('path', targetPath);
    if (!(await this.fs.pathExists(targetPath))) {
      return null;
    }
    const stat = await this.fs.stat(targetPath);
    if (stat.isFile()) {
      try {
        // 如果是非二进制文件，尝试返回文本内容而非 Buffer
        const isBinary = await this.isBinaryFile(targetPath);
        const content = await this.fs.readFile(targetPath);
        return {
          type: 'file',
          filename: path.basename(targetPath),
          path: path.relative(rootPath, targetPath),
          size: stat.size,
          createTime: stat.birthtime,
          modifyTime: stat.mtime,
          isBinary,
          content: isBinary ? content : content.toString(),
        };
      } catch (e) {
        this.ctx.logger.error(e);
        return null;
      }
    } else if (stat.isDirectory()) {
      try {
        // 遍历目录下的文件
        const dirFiles = await this.fs.readdir(targetPath);
        const files = dirFiles.map((f) => {
          const subStat = this.fs.statSync(path.join(targetPath, f));
          let type: 'file' | 'directory' | 'N/A' = 'N/A';
          if (subStat.isFile()) {
            type = 'file';
          } else if (subStat.isDirectory()) {
            type = 'directory';
          }
          return {
            type,
            filename: f,
            path: path.relative(rootPath, path.join(targetPath, f)),
            size: subStat.size,
            createTime: subStat.birthtime,
            modifyTime: subStat.mtime,
          };
        });
        return {
          type: 'directory',
          filename: path.basename(targetPath),
          path: path.relative(rootPath, targetPath),
          size: stat.size,
          createTime: stat.birthtime,
          modifyTime: stat.mtime,
          files,
        };
      } catch (e) {
        this.ctx.logger.error(e);
        return null;
      }
    }
    return null;
  }

  /**
   * 获取指定题目数据的归档文件。格式为 Zip。
   * @param problemId problemId
   */
  async getDataArchive(problemId: IProblemModel['problemId']) {
    const targetPath = path.join(this.judgerConfig.dataPath, 'data', problemId.toString());
    if (!(await this.fs.pathExists(targetPath))) {
      return null;
    }
    const zip = new this.AdmZip();
    zip.addLocalFolder(targetPath);
    return zip.toBuffer();
  }

  /**
   * 将 Zip 格式的题目数据包更新到题目目录下（全量覆盖）。
   * @param problemId problemId
   * @param filePath 题目数据包路径
   * @returns 是否更新成功，如何数据包内文件为空则认为更新失败
   */
  async updateData(problemId: IProblemModel['problemId'], filePath: string) {
    const targetPath = path.join(this.judgerConfig.dataPath, 'data', problemId.toString());
    const zip = new this.AdmZip(filePath);
    const zipEntries = zip.getEntries();
    if (zipEntries.length === 0) {
      return false;
    }
    await this.fs.remove(targetPath);
    await this.fs.ensureDir(targetPath);
    zip.extractAllTo(targetPath, true);
    return true;
  }

  /**
   * 检查 data repo git status。
   * @returns wording dir 是否为空
   */
  async checkIsDataGitStatusClean() {
    const res = await this.git.status();
    if (res.files.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * pull data repo git。
   */
  async pullDataGit() {
    return this.git.pull('origin', this.judgerConfig.dataGitBranch, { '--no-rebase': null });
  }

  /**
   * checkout data repo git。
   */
  async checkoutDataGit() {
    return this.git.checkout(this.judgerConfig.dataGitBranch);
  }

  /**
   * 提交一次题目数据更新的 git 更改。
   * @param name git 用户名
   * @param email git email
   * @param commitMessage commit 消息
   */
  async commitAndPushDataGit(
    problemId: IProblemModel['problemId'],
    name: string,
    email: string,
    commitMessage: string,
  ) {
    if (await this.checkIsDataGitStatusClean()) {
      return;
    }
    try {
      await this.git.addConfig('user.name', name);
      await this.git.addConfig('user.email', email);
      await this.git.add(`data/${problemId}`);
      await this.git.commit(commitMessage, `data/${problemId}`, {
        '--author': `"${name} <${email}>"`,
      });
      await this.git.push('origin', this.judgerConfig.dataGitBranch);
    } finally {
      this.git.addConfig('user.name', this.judgerConfig.dataGitUser);
      this.git.addConfig('user.email', this.judgerConfig.dataGitEmail);
    }
  }
}
