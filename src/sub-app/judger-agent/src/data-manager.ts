import net from 'net';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { dataManagerLogger } from './utils/logger';
import { getLatestDataReleaseIndex, downloadDataRelease, lsDataCases } from './utils/judger';
import type { IDataReleaseResult } from './typings';

const logger = dataManagerLogger;
const tempDir = path.join(os.tmpdir(), 'judger-agent');
const socketPath = path.join(tempDir, '/data-manager.sock');
const CACHE_EXPIRES = 5 * 1000;

if (fs.existsSync(socketPath)) {
  fs.unlinkSync(socketPath);
}

interface IDataReleaseTask {
  status: 'Doing' | 'Done';
  revision: number;
  extraHash?: string;
}

const statusMap: Record</** problemId */ number, IDataReleaseTask> = {};
const resultCache: Record<
  /** problemId */ number,
  Record</** extraHash */ string, IDataReleaseResult>
> = {};
const waitingClients: Record</** problemId */ number, net.Socket[]> = {};

async function fetchData(problemId: number, revision: number) {
  const [filename, extraHash] = await getLatestDataReleaseIndex(problemId);
  if (extraHash && resultCache[problemId]?.[extraHash]) {
    statusMap[problemId] = { status: 'Done', revision, extraHash };
    resultCache[problemId][extraHash].ts = Date.now();
    return resultCache[problemId][extraHash];
  } else {
    delete resultCache[problemId];
  }
  await downloadDataRelease(problemId, filename);
  const cases = await lsDataCases(problemId, extraHash);
  const result = { extraHash, cases, ts: Date.now() };
  if (!resultCache[problemId]) {
    resultCache[problemId] = {};
  }
  resultCache[problemId][extraHash] = result;
  statusMap[problemId] = { status: 'Done', revision, extraHash };
  return result;
}

const server = net.createServer((connection) => {
  logger.info('Client connected');

  connection.on('data', async (data) => {
    logger.info('Message from client:', data.toString());
    const req = JSON.parse(data.toString());
    const { problemId, revision } = req;

    if (!resultCache[problemId]) {
      resultCache[problemId] = {};
    }
    // check expires
    if (
      statusMap[problemId]?.status === 'Done' &&
      Date.now() - resultCache[problemId][statusMap[problemId].extraHash].ts > CACHE_EXPIRES
    ) {
      logger.info(`Cache of ${problemId} expired`);
      delete statusMap[problemId];
    }

    if (statusMap[problemId]?.status === 'Doing') {
      if (!waitingClients[problemId]) {
        waitingClients[problemId] = [];
      }
      waitingClients[problemId].push(connection);
    } else if (
      statusMap[problemId]?.status === 'Done' &&
      revision === statusMap[problemId].revision
    ) {
      const extraHash = statusMap[problemId].extraHash;
      const str = JSON.stringify(resultCache[problemId][extraHash]);
      connection.write(str);
      connection.end();
    } else {
      statusMap[problemId] = {
        status: 'Doing',
        revision,
      };
      waitingClients[problemId] = [connection];
      const res = await fetchData(problemId, revision);
      const str = JSON.stringify(res);
      waitingClients[problemId].forEach((conn) => {
        conn.write(str);
        conn.end();
      });
      delete waitingClients[problemId];
    }
  });

  connection.on('end', () => {
    logger.info('Client disconnected');
  });
});

server.listen(socketPath, () => {
  logger.info(`Server listening on ${socketPath}`);
});
