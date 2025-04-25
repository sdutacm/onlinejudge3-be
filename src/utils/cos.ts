import fs from 'fs';
import path from 'path';
import { provide, config, inject } from 'midway';
import { IAppConfig } from '@/config/config.interface';
import COS from 'cos-nodejs-sdk-v5';
import { IFs } from './libs/fs-extra';

export interface ICosCommonOptions {
  bucket?: string;
  region?: string;
}

@provide()
export default class CosHelper {
  private config: IAppConfig['tencentCloud']['cos'];
  private cos?: COS;

  @inject()
  fs: IFs;

  constructor(@config('tencentCloud') tencentCloud: IAppConfig['tencentCloud']) {
    this.config = tencentCloud.cos;
    if (tencentCloud.cos) {
      this.cos = new COS({
        SecretId: tencentCloud.cos.secretId,
        SecretKey: tencentCloud.cos.secretKey,
        Domain: tencentCloud.cos.domain,
      });
    }
  }

  public async uploadFile(
    file: Buffer | fs.ReadStream,
    remoteFilePath: string,
    options: ICosCommonOptions = {},
  ): Promise<void> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!file || !remoteFilePath) {
      throw new Error('Invalid COS upload parameters');
    }
    await this.cos.putObject({
      Bucket: options.bucket || this.config!.bucket,
      Region: options.region || this.config!.region,
      Key: remoteFilePath,
      Body: file,
    });
  }

  public async uploadDir(
    localDirPath: string,
    remoteDirPath: string,
    options: ICosCommonOptions = {},
  ): Promise<void> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!localDirPath || !remoteDirPath) {
      throw new Error('Invalid COS upload parameters');
    }
    const files = await this.fs.readdir(localDirPath);
    const uploadPromises = [];
    for (const file of files) {
      const localFilePath = path.join(localDirPath, file);
      const remoteFilePath = path.join(remoteDirPath, file);
      const fileStat = await this.fs.stat(localFilePath);
      if (fileStat.isDirectory()) {
        uploadPromises.push(this.uploadDir(localFilePath, remoteFilePath, options));
      } else {
        console.log(`Upload file: ${localFilePath} -> cos:${remoteFilePath}`);
        uploadPromises.push(
          this.uploadFile(fs.createReadStream(localFilePath), remoteFilePath, options),
        );
      }
    }
    await Promise.all(uploadPromises);
  }

  public async downloadFile(
    remoteFilePath: string,
    options: ICosCommonOptions = {},
  ): Promise<Buffer> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!remoteFilePath) {
      throw new Error('Invalid COS download parameters');
    }
    const res = await this.cos.getObject({
      Bucket: options.bucket || this.config!.bucket,
      Region: options.region || this.config!.region,
      Key: remoteFilePath,
    });
    return res.Body;
  }

  public async getFile(
    remoteFilePath: string,
    options: ICosCommonOptions = {},
  ): Promise<{
    headers: Record<string, any>;
    Body: Buffer;
  }> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!remoteFilePath) {
      throw new Error('Invalid COS download parameters');
    }
    const res = await this.cos.getObject({
      Bucket: options.bucket || this.config!.bucket,
      Region: options.region || this.config!.region,
      Key: remoteFilePath,
    });
    return {
      headers: res.headers || {},
      Body: res.Body,
    };
  }

  public async isFileExists(
    remoteFilePath: string,
    options: ICosCommonOptions = {},
  ): Promise<boolean> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!remoteFilePath) {
      throw new Error('Invalid COS file exist check parameters');
    }
    try {
      await this.cos.headObject({
        Bucket: options.bucket || this.config!.bucket,
        Region: options.region || this.config!.region,
        Key: remoteFilePath,
      });
      return true;
    } catch (e) {
      if (e.statusCode === 404) {
        return false;
      }
      throw e;
    }
  }

  public async deleteDir(remoteDirPath: string, options: ICosCommonOptions = {}): Promise<boolean> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!remoteDirPath) {
      throw new Error('Invalid COS delete directory parameters');
    }
    const listRes = await this.listFilesRecursive(remoteDirPath, options);
    if (listRes.contents.length === 0) {
      return true;
    }
    const keys = [
      ...listRes.contents.map((c) => ({ Key: c.Key })).reverse(),
      { Key: remoteDirPath },
    ];
    const res = await this.cos.deleteMultipleObject({
      Bucket: options.bucket || this.config!.bucket,
      Region: options.region || this.config!.region,
      Objects: keys,
    });
    if (res.Error.length > 0) {
      console.error('Error deleting COS directory:', res.Error);
    }
    return res.Error.length === 0;
  }

  public async deleteFile(remoteFilePath: string, options: ICosCommonOptions = {}): Promise<void> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!remoteFilePath) {
      throw new Error('Invalid COS delete file parameters');
    }
    await this.cos.deleteObject({
      Bucket: options.bucket || this.config!.bucket,
      Region: options.region || this.config!.region,
      Key: remoteFilePath,
    });
  }

  public async listFiles(
    remoteDirPath: string,
    options: ICosCommonOptions = {},
  ): Promise<{
    self: COS.CosObject | undefined;
    directories: string[];
    files: COS.CosObject[];
  }> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!remoteDirPath) {
      throw new Error('Invalid COS list files parameters');
    }
    let done = false;
    let marker: string | undefined;
    let selfObject: COS.CosObject | undefined;
    let contents: COS.CosObject[] = [];
    let commonPrefixes: { Prefix: COS.Prefix }[] = [];
    while (!done) {
      const res = await this.cos.getBucket({
        Bucket: options.bucket || this.config!.bucket,
        Region: options.region || this.config!.region,
        Prefix: remoteDirPath,
        Delimiter: '/',
        Marker: marker,
      });
      selfObject = res.Contents.find((c) => c.Key === remoteDirPath) || selfObject;
      contents = contents.concat(res.Contents).filter((c) => c.Key !== remoteDirPath);
      commonPrefixes = commonPrefixes.concat(res.CommonPrefixes);
      if (res.IsTruncated === 'true') {
        marker = res.NextMarker!;
      } else {
        done = true;
      }
    }
    return {
      self: selfObject,
      directories: commonPrefixes.map((p) => p.Prefix),
      files: contents,
    };
  }

  public async listFilesRecursive(
    remoteDirPath: string,
    options: ICosCommonOptions = {},
  ): Promise<{
    self: COS.CosObject | undefined;
    contents: COS.CosObject[];
  }> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!remoteDirPath) {
      throw new Error('Invalid COS list files parameters');
    }
    let done = false;
    let marker: string | undefined;
    let selfObject: COS.CosObject | undefined;
    let contents: COS.CosObject[] = [];
    while (!done) {
      const res = await this.cos.getBucket({
        Bucket: options.bucket || this.config!.bucket,
        Region: options.region || this.config!.region,
        Prefix: remoteDirPath,
        Marker: marker,
      });
      selfObject = res.Contents.find((c) => c.Key === remoteDirPath) || selfObject;
      contents = contents.concat(res.Contents).filter((c) => c.Key !== remoteDirPath);
      if (res.IsTruncated === 'true') {
        marker = res.NextMarker!;
      } else {
        done = true;
      }
    }
    return {
      self: selfObject,
      contents,
    };
  }
}

export type CCosHelper = CosHelper;
