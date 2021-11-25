// import * as tsConfigPaths from 'tsconfig-paths';
// import * as tsConfig from '../tsconfig.json';
// import 'tsconfig-paths/register';
import { Application } from 'midway';

// build db connections when starting APP
module.exports = (app: Application) => {
  app.beforeStart(async () => {
    console.log(
      `🚀 Sub App socket.io is launching... (NODE_ENV: ${process.env.NODE_ENV}, EGG_SERVER_ENV: ${process.env.EGG_SERVER_ENV})`,
    );

    console.log('✅ Sub App socket.io launched');
  });

  // @ts-ignore
  app.logger.info(
    'Sub App socket.io start...',
    // @ts-ignore
    `(NODE_ENV: ${process.env.NODE_ENV}, node: ${process.versions.node}, alinode: ${process.versions.alinode})`,
  );
};
