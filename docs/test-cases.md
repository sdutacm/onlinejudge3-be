# 如何写单元测试

## Controller

1. 在 `src/common/routes/be.route.ts` 查找路由，需要参考源码时进入对应模块的源码目录（如 user 模块在 `src/app/user/`）
2. 以路由为粒度写单测，测试代码在 `test/app/${module}/${module}.controller.test/ts`
3. 每个路由的测试写在一个 `describe` 内，一个测试用例通过对应一个 `it`。需要把正常返回以及出错返回的 case（throw Error）都测到（表单字段校验无需测试），如果正常返回有多种情况（如不同权限的身份返回不同字段），也要写多个 case 来保证覆盖
4. 运行 `PORT=${your_port} npm run devtest -- test/app/${module}/${module}.controller.test.ts -g ${route}` 执行单个路由的测试；运行 `PORT=${your_port} npm run cov` 执行全部代码的覆盖率测试

注意：

- 写单测时需简要阅读对应 controller 的源码，如果自己写的这个用例会执行到 service 层，则需要在这个用例里 mock 掉会执行的 service 方法，其参数和返回参考对应模块的 interface
- 接口时输出输出的数据结构可以参考对应模块的 contract ts：`src/common/contracts/${module}.ts`
