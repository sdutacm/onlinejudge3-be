import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { promisify } from 'util';
import net from 'net';
import AdmZip from 'adm-zip';
import config from '../config';
import { tencentCdnHelper } from './tencent-cdn';
import { dataManagerLogger, judgerAgentLogger } from './logger';
import type { IDataReleaseResult } from '../typings';

const tempDir = path.join(os.tmpdir(), 'judger-agent');
const socketPath = path.join(tempDir, '/data-manager.sock');

export async function lsDataCases(problemId: number, extraHashDir?: string) {
  const dir = path.join(config.judgerData.dataDir, problemId.toString(), extraHashDir || '');
  const files = (await fs.readdir(dir)).filter((file) => /^data\d+\.(in|out)$/.test(file));
  const caseNumberSetTemp = new Set<number>();
  const caseNumberSet = new Set<number>();
  for (const file of files) {
    const regex = /data(\d+)\.(in|out)/;
    const caseNumber = +file.match(regex)?.[1];
    if (!caseNumber) {
      continue;
    }
    if (caseNumberSetTemp.has(caseNumber)) {
      caseNumberSet.add(caseNumber);
    } else {
      caseNumberSetTemp.add(caseNumber);
    }
  }
  const cases = Array.from(caseNumberSet).sort((a, b) => a - b);
  return cases.map((c) => ({ in: `data${c}.in`, out: `data${c}.out` }));
}

export async function getLatestDataReleaseIndex(problemId: number) {
  const latestIndex = (
    await tencentCdnHelper.downloadFile(`/judger/data-release/${problemId}/latest.txt`)
  ).toString();
  const filename = latestIndex.trim();
  const extraHash = path.parse(filename).name;
  dataManagerLogger.info(`Got latest data release index "${filename}" for problem ${problemId}`);
  return [filename, extraHash];
}

export async function downloadDataRelease(problemId: number, filename: string) {
  const tempDir = path.join(os.tmpdir(), 'judger-agent');
  await fs.ensureDir(tempDir);
  const archiveTempPath = path.join(tempDir, filename);
  dataManagerLogger.info(`Downloading data release "${filename}" for problem ${problemId}`);
  await tencentCdnHelper.downloadFileTo(
    `/judger/data-release/${problemId}/${filename}`,
    archiveTempPath,
  );
  dataManagerLogger.info(`Extracting "${archiveTempPath}" for problem ${problemId}`);
  // extract to data dir
  const extraHash = path.parse(filename).name;
  const saveDir = path.join(config.judgerData.dataDir, problemId.toString(), extraHash);
  await fs.ensureDir(saveDir);
  const zip = new AdmZip(archiveTempPath);
  await promisify(zip.extractAllToAsync)(saveDir, true);
  await fs.unlink(archiveTempPath);
  dataManagerLogger.info(`Data release "${filename}" is ready for problem ${problemId}`);
}

export function getProblemDataResult(
  problemId: number,
  revision: number,
): Promise<IDataReleaseResult> {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({ path: socketPath }, () => {
      judgerAgentLogger.info('Connected to data manager');
      client.write(JSON.stringify({ problemId, revision }));
    });

    client.on('data', (data) => {
      judgerAgentLogger.info('Message from data manager:', data.toString());
      resolve(JSON.parse(data.toString()));
    });

    client.on('error', (err) => {
      reject(err);
    });

    client.on('end', () => {
      judgerAgentLogger.info('Disconnected from data manager');
    });
  });
}
