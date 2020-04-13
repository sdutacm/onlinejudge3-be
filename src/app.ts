// import * as tsConfigPaths from 'tsconfig-paths';
// import * as tsConfig from '../tsconfig.json';
// import 'tsconfig-paths/register';
import { DB } from '@/lib/models/db';
import { Application } from 'midway';

// const tsConfig = require('./tsconfig.json');
// const tsConfigPaths = require('tsconfig-paths');

// const { baseUrl, outDir, paths } = tsConfig.compilerOptions;
// const outDirPaths = Object.entries(paths).reduce(
//   (outDirPaths, [k, v]) =>
//     Object.assign(outDirPaths, {
//       [k]: (v as any).map((path: string) => path.replace(/^src\//, `./`)),
//     }),
//   {},
// );
// console.log('baseUrl', baseUrl, 'paths', outDirPaths);

// tsConfigPaths.register({ baseUrl, paths: outDirPaths });
// console.log(require);

// build db connections when starting APP
module.exports = (app: Application) => {
  app.beforeStart(async () => {
    console.log('🚀 App is launching...');

    await DB.initDB(app.config.sequelize);

    console.log('✅ App launched');
  });
};