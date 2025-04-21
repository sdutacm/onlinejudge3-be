import { provide, inject, Context, config } from 'midway';
import { CJudgerMeta } from './judger.meta';
import {
  IMJudgerServiceGetDataFileRes,
  IMJudgerLanguageConfig,
  IMJudgerServiceGetDataFileRespObjectDirFile,
} from './judger.interface';
import { IProblemModel } from '../problem/problem.interface';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import path from 'path';
import os from 'os';
import { IFs } from '@/utils/libs/fs-extra';
import { IIsBinaryFile } from '@/utils/libs/isbinaryfile';
import { CAdmZip } from '@/utils/libs/adm-zip';
import { ISimpleGit, SimpleGit } from '@/utils/libs/simple-git';
import { IJudgerConfig } from '@/config/judger.config';
import { Judger } from '@/lib/services/judger';
import { IAppConfig } from '@/config/config.interface';
import { CCosHelper } from '@/utils/cos';
import { CPromiseQueue } from '@/utils/libs/promise-queue';

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

  @inject()
  cosHelper: CCosHelper;

  @inject('PromiseQueue')
  PromiseQueue: CPromiseQueue;

  judgerCosConfig?: {
    region: string;
    bucket: string;
  };

  constructor(
    @config('judger')
    judgerConfig: IJudgerConfig,

    @config('tencentCloud')
    tencentCloudConfig: IAppConfig['tencentCloud'],

    @inject()
    simpleGit: ISimpleGit,
  ) {
    if (judgerConfig.dataUsingGit) {
      this.git = simpleGit(judgerConfig.dataPath);
    }
    if (judgerConfig.cos && tencentCloudConfig?.cos) {
      this.judgerCosConfig = {
        region: judgerConfig.cos.region,
        bucket: judgerConfig.cos.bucket,
      };
    }
  }

  /**
   * 获取语言配置缓存。
   * 如果未找到缓存，则返回 `null`
   */
  private async _getLanguageConfigCache(): Promise<IMJudgerLanguageConfig | null> {
    return this.ctx.helper.redisGet<IMJudgerLanguageConfig>(this.redisKey.judgerLanguageConfig);
  }

  /**
   * 设置语言配置缓存。
   * @param data 数据
   */
  private async _setLanguageConfigCache(data: IMJudgerLanguageConfig | null): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.judgerLanguageConfig,
      [],
      data,
      data ? this.durations.cacheDetailLong : this.durations.cacheDetailNull,
    );
  }

  /**
   * 获取数据目录下指定路径的文件信息，对于目录，还会返回目录下文件列表。
   * @param filePath 文件路径
   */
  async getDataFileFromLocal(filePath: string): Promise<IMJudgerServiceGetDataFileRes> {
    if (!this.judgerConfig.dataPath) {
      throw new Error('Judger data path is not set');
    }
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
          content: isBinary ? content.toString('base64') : content.toString(),
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
            path:
              path.relative(rootPath, path.join(targetPath, f)) + (type === 'directory' ? '/' : ''),
            size: subStat.size,
            createTime: subStat.birthtime,
            modifyTime: subStat.mtime,
          };
        });
        return {
          type: 'directory',
          filename: path.basename(targetPath),
          path: path.relative(rootPath, targetPath) + '/',
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
   * 获取数据目录下指定路径的文件信息，对于目录，还会返回目录下文件列表。
   * @param filePath 文件路径
   */
  async getDataFileFromRemoteCos(filePath: string): Promise<IMJudgerServiceGetDataFileRes> {
    if (!this.judgerCosConfig) {
      throw new Error('Judger COS config is not set');
    }
    const rootPath = 'judger/data';
    const targetPath = path.join(rootPath, filePath);
    if (!filePath.endsWith('/')) {
      // get as single file
      try {
        const res = await this.cosHelper.getFile(targetPath, {
          bucket: this.judgerCosConfig.bucket,
          region: this.judgerCosConfig.region,
        });
        const isBinary = await this.isBinaryFile(res.Body);
        return {
          type: 'file',
          filename: path.basename(targetPath),
          path: path.relative(rootPath, targetPath),
          size: +res.headers['content-length'],
          createTime: new Date(res.headers['last-modified']),
          modifyTime: new Date(res.headers['last-modified']),
          isBinary,
          content: isBinary ? res.Body.toString('base64') : res.Body.toString(),
        };
      } catch (e) {
        if (e.statusCode === 404) {
          return null;
        }
        this.ctx.logger.error('getDataFileFromRemoteCos error:', e);
        throw e;
      }
    } else {
      // list dir files
      const res = await this.cosHelper.listFiles(targetPath, {
        bucket: this.judgerCosConfig!.bucket,
        region: this.judgerCosConfig!.region,
      });
      if (res.directories.length === 0 && res.files.length === 0) {
        return null;
      }
      const files = res.files.map((f) => {
        return {
          type: 'file',
          filename: path.basename(f.Key),
          path: path.relative(rootPath, f.Key),
          size: +f.Size,
          modifyTime: new Date(f.LastModified),
        } as IMJudgerServiceGetDataFileRespObjectDirFile;
      });
      return {
        type: 'directory',
        filename: path.basename(targetPath),
        path: path.relative(rootPath, targetPath) + '/',
        size: +(res.self?.Size || 0),
        modifyTime: res.self ? new Date(res.self.LastModified) : undefined,
        files: [
          ...res.directories.map(
            (d) =>
              ({
                type: 'directory',
                filename: path.basename(d),
                path: path.relative(rootPath, d) + '/',
                size: 0,
              } as IMJudgerServiceGetDataFileRespObjectDirFile),
          ),
          ...files,
        ],
      };
    }
  }

  /**
   * 获取数据目录下指定路径的文件信息，对于目录，还会返回目录下文件列表。
   * @param filePath 文件路径
   */
  async getDataFile(filePath: string): Promise<IMJudgerServiceGetDataFileRes> {
    if (this.judgerCosConfig) {
      return this.getDataFileFromRemoteCos(filePath);
    } else if (this.judgerConfig.dataPath) {
      return this.getDataFileFromLocal(filePath);
    }
    return null;
  }

  /**
   * 从本地文件系统获取指定题目数据的归档文件。
   * @param problemId problemId
   */
  async getDataArchiveFromLocal(problemId: IProblemModel['problemId']) {
    if (!this.judgerConfig.dataPath) {
      throw new Error('Judger data path is not set');
    }
    const targetPath = path.join(this.judgerConfig.dataPath, 'data', problemId.toString());
    if (!(await this.fs.pathExists(targetPath))) {
      return null;
    }
    const zip = new this.AdmZip();
    zip.addLocalFolder(targetPath);
    return zip.toBuffer();
  }

  /**
   * 从远程 COS 获取指定题目数据的归档文件。
   * @param problemId problemId
   */
  async getDataArchiveFromRemoteCos(problemId: IProblemModel['problemId']) {
    // download data from cos to tmp dir
    const savePath = path.join(
      os.tmpdir(),
      'onlinejudge3-judgerdata-save',
      problemId.toString() + '-' + Date.now().toString(),
    );
    await this.fs.ensureDir(savePath);
    const remotePath = `judger/data/${problemId}/`;
    const res = await this.cosHelper.listFilesRecursive(remotePath, {
      bucket: this.judgerCosConfig!.bucket,
      region: this.judgerCosConfig!.region,
    });
    if (res.contents.length === 0) {
      return null;
    }
    const files = res.contents.filter((f) => !f.Key.endsWith('/')).map((f) => f.Key);
    const pq = new this.PromiseQueue(20, Infinity);
    const queueTasks = files.map((file) =>
      pq.add(async () => {
        const fileSavePath = path.join(savePath, path.relative(remotePath, file));
        const fileContent = await this.cosHelper.downloadFile(file, {
          bucket: this.judgerCosConfig!.bucket,
          region: this.judgerCosConfig!.region,
        });
        await this.fs.ensureFile(fileSavePath);
        await this.fs.writeFile(fileSavePath, fileContent);
      }),
    );
    await Promise.all(queueTasks);
    const zip = new this.AdmZip();
    zip.addLocalFolder(savePath);
    return zip.toBuffer();
  }

  /**
   * 获取指定题目数据的归档文件。格式为 zip。
   * @param problemId problemId
   */
  async getDataArchive(problemId: IProblemModel['problemId']) {
    if (this.judgerCosConfig) {
      return this.getDataArchiveFromRemoteCos(problemId);
    } else if (this.judgerConfig.dataPath) {
      return this.getDataArchiveFromLocal(problemId);
    }
    return null;
  }

  /**
   * 更新 zip 格式的题目数据包（全量覆盖）。
   * @param problemId problemId
   * @param filePath 题目数据包路径
   * @returns 是否更新成功，如果数据包内文件为空则认为更新失败
   */
  async updateData(
    problemId: IProblemModel['problemId'],
    filePath: string,
    commitData?: {
      name: string;
      email: string;
      commitMessage: string;
    },
  ) {
    if (!problemId) {
      throw new Error(`InvalidJudgerDataError: ${problemId} is undefined`);
    }
    // 写入覆盖到本地文件系统
    if (this.judgerConfig.dataPath) {
      const targetPath = path.join(this.judgerConfig.dataPath, 'data', problemId.toString());
      this.ctx.logger.info('Extracting data zip to', targetPath);
      const zip = new this.AdmZip(filePath);
      const zipEntries = zip.getEntries();
      if (zipEntries.length === 0) {
        return false;
      }
      await this.fs.remove(targetPath);
      await this.fs.ensureDir(targetPath);
      zip.extractAllTo(targetPath, true);
      this.ctx.logger.info('Extracted data zip');
    }
    // 上传到远端 COS
    if (this.judgerCosConfig) {
      // upload complete data to data/
      // TODO add problem id level lock
      const targetPath = path.join(
        os.tmpdir(),
        'onlinejudge3-judgerdata-upload',
        problemId.toString() + '-' + Date.now().toString(),
      );
      const zip = new this.AdmZip(filePath);
      const zipEntries = zip.getEntries();
      if (zipEntries.length === 0) {
        return false;
      }
      await this.fs.remove(targetPath);
      await this.fs.ensureDir(targetPath);
      zip.extractAllTo(targetPath, true);
      this.ctx.logger.info(`Extracted data zip for cos uploading to ${targetPath}`);
      const remotePath = `judger/data/${problemId}/`;
      const deleteRes = await this.cosHelper.deleteDir(remotePath, {
        bucket: this.judgerCosConfig.bucket,
        region: this.judgerCosConfig.region,
      });
      if (!deleteRes) {
        this.ctx.logger.error('Failed to delete old data dir from COS');
        return false;
      }
      await this.cosHelper.uploadDir(targetPath, remotePath, {
        bucket: this.judgerCosConfig.bucket,
        region: this.judgerCosConfig.region,
      });
      this.ctx.logger.info(`Uploaded problem ${problemId} complete data to COS`);

      // upload release to data-release/
      this.ctx.logger.info(`Uploading problem ${problemId} data release to COS`);
      const dataReleaseBase = `judger/data-release/${problemId}`;
      const remoteFileName = `${Math.floor(Date.now() / 1000)}_${this.utils.misc.randomString({
        length: 6,
        type: 'numeric',
      })}.zip`;
      await this.cosHelper.uploadFile(
        this.fs.createReadStream(filePath),
        `${dataReleaseBase}/${remoteFileName}`,
        { bucket: this.judgerCosConfig.bucket, region: this.judgerCosConfig.region },
      );
      await this.cosHelper.uploadFile(
        Buffer.from(new TextEncoder().encode(remoteFileName)),
        `${dataReleaseBase}/latest.txt`,
        { bucket: this.judgerCosConfig.bucket, region: this.judgerCosConfig.region },
      );
      this.ctx.logger.info(
        `Uploaded problem ${problemId} data release to COS. Latest release: ${remoteFileName}`,
      );

      // upload an update history file to data-commit/
      const commitFileName = `${Date.now()}-${problemId}-${remoteFileName}.commit.json`;
      const commitFileContent = JSON.stringify(commitData || {});
      await this.cosHelper.uploadFile(
        Buffer.from(commitFileContent),
        `judger/data-commit/${commitFileName}`,
        { bucket: this.judgerCosConfig.bucket, region: this.judgerCosConfig.region },
      );
      this.ctx.logger.info(`Uploaded problem ${problemId} data commit history to COS`);
    }
    return true;
  }

  /**
   * 检查 data repo git status。
   * @returns wording dir 是否为空
   */
  async checkIsDataGitStatusClean() {
    if (!this.judgerConfig.dataUsingGit) {
      console.log('`checkIsDataGitStatusClean` is skipped due to git disabled');
      return true;
    }
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
    if (!this.judgerConfig.dataUsingGit) {
      console.log('`pullDataGit` is skipped due to git disabled');
      return;
    }
    return this.git.pull('origin', this.judgerConfig.dataGitBranch, { '--no-rebase': null });
  }

  /**
   * checkout data repo git。
   */
  async checkoutDataGit() {
    if (!this.judgerConfig.dataUsingGit) {
      console.log('`checkoutDataGit` is skipped due to git disabled');
      return;
    }
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
    if (!this.judgerConfig.dataUsingGit) {
      console.log('`commitAndPushDataGit` is skipped due to git disabled');
      return;
    }
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

  /**
   * 获取远程评测机语言配置缓存。
   */
  async getLanguageConfigFromRemoteJudger(): Promise<IMJudgerLanguageConfig> {
    let res: IMJudgerLanguageConfig | null = null;
    const cached = await this._getLanguageConfigCache();
    cached && (res = cached);
    if (!res) {
      try {
        // @ts-ignore
        const judger = this.ctx.app.judger as Judger;
        res = (await judger.getLanguageConfig()) as IMJudgerLanguageConfig;
        await this._setLanguageConfigCache(res);
      } catch (e) {
        this.ctx.logger.error('getLanguageConfig error', e);
        await this._setLanguageConfigCache(null);
        throw e;
      }
    }
    return res;
  }

  /**
   * 获取评测机语言配置缓存。
   */
  async getLanguageConfig(): Promise<IMJudgerLanguageConfig> {
    let res = await this.ctx.helper.redisGet<IMJudgerLanguageConfig>(
      this.redisKey.confJudgerLanguages,
    );
    if (!res) {
      res = await this.getLanguageConfigFromRemoteJudger();
    }
    if (!res) {
      throw new Error('Cannot find judger language config');
    }
    return res;
  }
}
