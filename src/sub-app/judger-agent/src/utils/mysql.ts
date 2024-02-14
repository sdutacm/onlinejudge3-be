import mysql from 'mysql2/promise';
import config from '../config';

export type IDbPool = mysql.Pool;

export function getPool() {
  return mysql.createPool({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.username,
    password: config.mysql.password,
    database: config.mysql.database,
    connectionLimit: 1,
  });
}
