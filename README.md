# onlinejudge3-be

## 快速入门

框架文档，参见 [Midway 文档](https://midwayjs.org/midway/guide.html) 和 [Egg 文档](https://eggjs.org/zh-cn/intro/https://eggjs.org/zh-cn/intro/)。

### 本地开发

```bash
$ git submodule init && git submodule update
$ git clone git@github.com:sdutacm/judger-data_test.git
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

如果安装依赖时遇到 Sharp 下载时间过长，可以尝试 `SHARP_DIST_BASE_URL="http://acm.sdut.edu.cn/temp_vendors/sharp/" npm i` 来安装（目前仅测试 Ubuntu 16.04/18.04）。

如果需要断点调试，建议直接通过 VS Code，运行 Debug 命令 `Debug`，不需要手动运行 `npm run dev`。

### 部署

```bash
$ npm start
$ npm stop
```

### 单元测试

- [midway-bin] 内置了 [mocha], [thunk-mocha], [power-assert], [istanbul] 等框架，让你可以专注于写单元测试，无需理会配套工具。
- 断言库非常推荐使用 [power-assert]。
- 具体参见 [midway 文档 - 单元测试](https://eggjs.org/zh-cn/core/unittest)。

### 内置指令

- 使用 `npm run lint` 来做代码风格检查。
- 使用 `npm test` 来执行单元测试。
- 使用 `npm run autod` 来自动检测依赖更新，详细参见 [autod](https://www.npmjs.com/package/autod) 。

## 开发指导

### TypeScript 类型命名规范

- `I` 开头：Interface
- `T` 开头：Type
- `E` 开头：Enum
- `C` 开头：Class

### 目录规范

```
src
├── app
│   ├── extend
│   │   ├── application.ts // egg 应用扩展
│   │   └── helper.ts // egg helper 扩展
│   ├── user // 模块目录，以 user 为例
│   │   ├── user.contract.ts // 请求和响应的数据格式契约
│   │   ├── user.controller.ts // controller
│   │   ├── user.interface.ts // 类型定义，通常是来自 model 和 service
│   │   ├── user.meta.ts // meta，通常用来定义模块名、数据库主键、缓存 key 等
│   │   └── user.service.ts // service
├── app.ts // app 入口文件
├── common // 公共目录，前后端通用，因此请注意不要在此引入 node 变量或者 window/document 变量
│   ├── codes // 响应的返回码配置，只应修改 json
│   ├── contracts // 契约文件的 ts 类型定义
│   ├── enums // 枚举值
│   └── routes // 路由配置
├── config // 应用配置文件
│   ├── config.default.ts // 基础配置（其他配置会从此继承合并）
│   ├── config.interface.ts // 配置的类型定义
│   ├── config.local.ts // 开发环境配置
│   ├── config.prod.ts // 生产环境配置
│   ├── config.unittest.ts // 单元测试环境配置
│   ├── durations.config.ts // 持续时间配置
│   ├── plugin.ts // 插件配置
│   └── redisKey.config.ts // redis key 配置
├── lib
│   ├── decorators // 自定义装饰器
│   ├── global // 全局使用函数
│   └── models // 数据库 model 定义
├── middlewares // 中间件
├── typings // 类型定义
│   ├── app // 扩展框架类型定义
│   │   └── extend
│   │       ├── application.d.ts
│   │       └── helper.d.ts
│   ├── contract.d.ts
│   ├── general.d.ts // 一些通用 ts 类型
│   ├── global.d.ts // 全局可用的 ts 类型
│   ├── index.d.ts
│   ├── meta.d.ts
│   ├── model.d.ts
│   └── service.d.ts
└── utils // util 工具函数库
```
