//#region service.getDataFile
export type IMJudgerServiceGetDataFileRes = {
  type: 'file' | 'directory';
  filename: string;
  path: string;
  size: number;
  createTime: Date;
  modifyTime: Date;
  isBinary?: boolean; // 仅限文件
  content?: string | Buffer; // 仅限文件
  files?: Array<{
    type: 'file' | 'directory' | 'N/A';
    filename: string;
    path: string;
    size: number;
    createTime: Date;
    modifyTime: Date;
  }>; // 仅限目录
} | null;
//#endregion
