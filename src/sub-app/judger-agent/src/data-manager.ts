import net from 'net';
import http from 'http';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { dataManagerLogger } from './utils/logger';
import { getLatestDataReleaseIndex, downloadDataRelease, lsDataCases } from './utils/judger';
import type { IDataReleaseResult } from './typings';
import config from './config';

const logger = dataManagerLogger;
const tempDir = path.join(os.tmpdir(), 'judger-agent');
const socketPath = config.judgerData.dataManagerSocketPath;
let isReady = false;
const CACHE_EXPIRES = 5 * 1000;
const HEALTH_PORT = parseInt(process.env.HEALTH_CHECK_PORT, 10) || 3373;

fs.ensureDirSync(tempDir);
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
      logger.info(`[${problemId}]`, `Cache expired`);
      delete statusMap[problemId];
    }

    if (statusMap[problemId]?.status === 'Doing') {
      logger.info(`[${problemId}]`, 'Added to waiting queue');
      if (!waitingClients[problemId]) {
        waitingClients[problemId] = [];
      }
      waitingClients[problemId].push(connection);
    } else if (
      statusMap[problemId]?.status === 'Done' &&
      revision === statusMap[problemId].revision
    ) {
      logger.info(`[${problemId}]`, 'Cache hit');
      const extraHash = statusMap[problemId].extraHash;
      const str = JSON.stringify(resultCache[problemId][extraHash]);
      connection.write(str);
      connection.end();
    } else {
      logger.info(`[${problemId}]`, 'Fetching data');
      statusMap[problemId] = {
        status: 'Doing',
        revision,
      };
      waitingClients[problemId] = [connection];
      let str;
      try {
        const res = await fetchData(problemId, revision);
        str = JSON.stringify({
          success: true,
          data: res,
        });
      } catch (e) {
        logger.error(`[${problemId}]`, 'Failed to fetch data:', e);
        delete statusMap[problemId];
        str = JSON.stringify({
          success: false,
          msg: e.message,
        });
      }
      waitingClients[problemId].forEach((conn) => {
        conn.write(str);
        conn.end();
      });
      delete waitingClients[problemId];
    }
  });

  connection.on('end', () => {
    // logger.info('Client disconnected');
  });
});

server.listen(socketPath, () => {
  logger.info(`Data manager server is listening on ${socketPath}`);
  isReady = true;
});

// Health check server
const healthServer = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    if (!isReady) {
      res.writeHead(503);
      res.end('Not ready');
      return;
    }
    res.writeHead(200);
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end();
  }
});

healthServer.listen(HEALTH_PORT, () => {
  logger.info(`Health check server is listening on http://127.0.0.1:${HEALTH_PORT}`);
});

function beforeExit() {
  logger.info('Clear up before exit');
  server.close();
  healthServer.close();
}

process.on('SIGINT', beforeExit);
process.on('SIGTERM', beforeExit);
