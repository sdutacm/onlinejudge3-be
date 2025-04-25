import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { promisify } from 'util';
import net from 'net';
import AdmZip from 'adm-zip';
import config from '../config';
import { getSingletonDataHelper } from './data-helper';
import { dataManagerLogger, judgerAgentLogger } from './logger';
import type { IDataReleaseResult } from '../typings';

const socketPath = config.judgerData.dataManagerSocketPath;

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
  const start = Date.now();
  const latestIndex = (
    await getSingletonDataHelper().downloadFile(
      `${config.judgerData.remoteSource.basePath}/${problemId}/latest.txt`,
    )
  ).toString();
  const filename = latestIndex.trim();
  const extraHash = path.parse(filename).name;
  dataManagerLogger.info(
    `[${problemId}]`,
    `Got latest data release index "${filename}" in ${Date.now() - start}ms`,
  );
  return [filename, extraHash];
}

export async function downloadDataRelease(problemId: number, filename: string) {
  const tempDir = path.join(os.tmpdir(), 'judger-agent');
  await fs.ensureDir(tempDir);
  const extraHash = path.parse(filename).name;
  const saveDir = path.join(config.judgerData.dataDir, problemId.toString(), extraHash);
  const readyMarkFilePath = path.join(saveDir, '.ready');
  if (await fs.pathExists(readyMarkFilePath)) {
    dataManagerLogger.info(
      `[${problemId}]`,
      `Data release "${extraHash}" is already downloaded, skipped`,
    );
    return;
  }

  dataManagerLogger.info(`[${problemId}]`, `Downloading data release "${filename}"`);
  let start = Date.now();
  const archiveTempPath = path.join(tempDir, `${problemId}_${filename}`);
  await getSingletonDataHelper().downloadFileTo(
    `${config.judgerData.remoteSource.basePath}/${problemId}/${filename}`,
    archiveTempPath,
  );
  dataManagerLogger.info(`[${problemId}]`, `Downloaded data release in ${Date.now() - start}ms`);
  // extract to data dir
  dataManagerLogger.info(`[${problemId}]`, `Extracting "${archiveTempPath}" to "${saveDir}"`);
  start = Date.now();
  await fs.ensureDir(saveDir);
  const zip = new AdmZip(archiveTempPath);
  await promisify(zip.extractAllToAsync)(saveDir, true);
  await fs.unlink(archiveTempPath);
  await fs.ensureFile(readyMarkFilePath);
  dataManagerLogger.info(`[${problemId}]`, `Extracted in ${Date.now() - start}ms`);
  dataManagerLogger.info(`[${problemId}]`, `Data release "${extraHash}" is ready`);
}

export function getProblemDataResult(
  problemId: number,
  revision: number,
): Promise<IDataReleaseResult> {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({ path: socketPath }, () => {
      judgerAgentLogger.info(
        `Connected to data manager, requesting problemId=${problemId}, revision=${revision}`,
      );
      client.write(JSON.stringify({ problemId, revision }));
    });

    client.on('data', (data) => {
      const res = JSON.parse(data.toString());
      if (res.success) {
        resolve(res.data);
      } else {
        reject(new Error(res.msg));
      }
    });

    client.on('error', (err) => {
      reject(err);
    });

    client.on('end', () => {
      reject(new Error('Disconnected from data manager'));
    });
  });
}
