# onlinejudge3-be

## 历史和技术栈

自 OnlineJudge3 于 2018 年进行初版内测以来，由于核心贡献者基本都在准备面试和实习，产能严重受限，后端初期是在 OJ2 上开发了一层 API 来提供给 OJ3 前端使用的。

由于老的 PHP 项目可维护性差、性能不佳等原因，我们启动了本项目，以 JS 同构开发模式重构了整个后端，在当时使用了较新的 Node.js Web 技术栈，获得了高效敏捷的开发体验，并且拥有不俗的性能。

需要安装或准备的组件：
- Node.js（推荐使用 14.x）
- MySQL
- Redis

开发框架：

采用 Midway.js 作为 Web 开发框架。如有需要可以参考其文档。

## 本地开发

### 1. 准备数据库

新建名为 `oj` 的 MySQL 数据库，并从 `misc/oj-init-xxx.sql` 导入初始数据，其包含了一个管理员用户，其用户名为 `root`，密码为 `123456`，以及初始的题目。

### 2. 启动和配置数据库

确保 MySQL 和 Redis 已经启动，然后在 `src/config/config.default.ts` 中配置连接信息。

### 3. 初始化项目

```bash
git submodule init && git submodule update
npm i
```

### 4. 启动本地开发

后端开发服务：

```bash
npm run dev
```

【可选】Socket.io（用于推送消息，如评测进度）：

```bash
npm run dev-socket-io
```

如果需要断点调试，建议直接通过 VS Code，运行 Debug 命令 `Debug`，不需要手动运行 `npm run dev`。

> Tips：首次初始化项目并启动前后端后，可以使用管理员用户登录，在右上角菜单进入 Admin 进行数据管理。

### 5.【可选】其他依赖：

- [onlinejudge3-scripts](https://github.com/sdutacm/onlinejudge3-scripts)：外部脚本，目前包含 Rating 计算脚本，clone 后在 `src/config/config.default.ts` 配置其路径
- [onlinejudge3-schedules](https://github.com/sdutacm/onlinejudge3-schedules)：定时任务，部分离线数据需要定时任务计算
- [judger-data_test](https://github.com/sdutacm/judger-data_test)：开发用评测数据，clone 后在 `src/config/judger.config.ts` 配置其路径
- [river](https://github.com/MeiK2333/river)：强大、安全、领先的评测机，本地部署后在 `src/config/judger.config.ts` 配置 `address`

## 部署

首次部署，复制配置文件模板：
- `src/config/config.prod.template.ts` -> `src/config/config.prod.ts`
- `src/sub-app/socket-io/src/config/config.prod.template.ts` -> `src/sub-app/socket-io/src/config/config.prod.ts`

根据生产环境配置修改即可。最终使用的配置会基于 `config.default.ts` 合并，因此只需要配置生产环境上有更改的项即可。

构建：
```bash
npm run build
cd src/sub-app/socket-io && npm run build && cd -
```  

启动后端服务：

```bash
npm start
cd src/sub-app/socket-io && npm start && cd -
```

> Tips：可以添加环境变量 `EGG_WORKERS` 指定进程数，`PORT` 指定端口。

停止后端服务：

```bash
npm stop
cd src/sub-app/socket-io && npm stop && cd -
```

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
├── common // 公共逻辑和配置子模块，前后端通用，因此请注意不要在此引入 node 变量或者 window/document 变量
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
