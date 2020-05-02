import { assert } from 'midway-mock/bootstrap';

before(() => {
  assert.strictEqual(process.env.NODE_ENV, 'test'); // 防止 midway 搞事情，测试时把开发环境的数据污染了 @ref https://github.com/midwayjs/midway/issues/480
});
