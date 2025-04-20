export type IMJudgerLanguageConfig = {
  language: string;
  compile: string;
  run: string;
  version: string;
}[];

//#region service.getDataFile
export interface IMJudgerServiceGetDataFileRespObjectDirFile {
  type: 'file' | 'directory' | 'N/A';
  filename: string;
  path: string;
  size: number;
  createTime?: Date;
  modifyTime?: Date;
}

export interface IMJudgerServiceGetDataFileRespObject {
  type: 'file' | 'directory';
  filename: string;
  path: string;
  size: number;
  createTime?: Date;
  modifyTime?: Date;
  isBinary?: boolean; // 仅限文件
  content?: string | Buffer; // 仅限文件
  files?: IMJudgerServiceGetDataFileRespObjectDirFile[]; // 仅限目录
}

export type IMJudgerServiceGetDataFileRes = IMJudgerServiceGetDataFileRespObject | null;
//#endregion
