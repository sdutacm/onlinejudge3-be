import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { provide, scope, ScopeEnum } from 'midway';
import * as path from 'path';
// import { UserModel } from './user.model';
// import { ProblemModel } from './problem';

// providing DB.sequelize in case of hyper features
// of sequelize like "sequelize.transaction"
@scope(ScopeEnum.Singleton)
@provide('DB')
export class DB {
  public static sequelize: Sequelize;

  public static async initDB(config: SequelizeOptions) {
    DB.sequelize = new Sequelize({
      database: config.database,
      username: config.username,
      password: config.password,
      host: config.host,
      port: config.port || 3306,
      dialect: config.dialect || 'mysql',
      timezone: config.timezone || '+08:00',
      logQueryParameters: true,
      // operatorsAliases: false,
    });

    // add models here before using them
    // DB.sequelize.addModels([UserModel, ProblemModel]);
    DB.sequelize.addModels([path.join(__dirname, '/**/*.model.[j|t]s')]);

    try {
      await DB.sequelize.authenticate();
      // await DB.sequelize.sync();
      // await DB.sequelize.sync({ force: true });
    } catch (error) {
      error.message = `DB connection error: ${error.message}`;
      throw error;
    }
  }
}
