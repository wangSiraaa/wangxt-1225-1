# 水产养殖基地管理系统

管理水产养殖基地的水质、投喂、用药和销售批次，实现从养殖到出塘的全流程管控。

## 功能特性

### 🌊 池塘管理
- 池塘档案管理（面积、品种、存塘数量等）
- 水质数据录入（溶氧、pH、水温、氨氮、亚硝酸盐、浊度）
- 死亡率记录
- 传感器实时数据监控（Redis 缓存最新值）
- 溶氧连续偏低自动预警

### 💊 用药管理
- 药品档案管理（支持标记禁用药）
- 开具用药方案（自动校验禁用药）
- 停药期自动计算
- 池塘当前有效用药方案查询
- 停药期检查接口

### 📦 批次管理
- 养殖批次管理（放苗、品种、数量）
- 销售批次生成（出塘）
- **停药期校验**：停药期未满禁止生成销售批次
- 质检员确认放行流程
- 批次预检功能（提前检查是否可出塘）

### 🛠️ 设备工单
- 增氧设备工单管理
- **溶氧自动触发**：连续3次溶氧低于阈值自动生成工单
- 工单状态流转（待处理 → 处理中 → 已完成/已取消）
- 工单统计看板

## 技术栈

### 后端
- **框架**: NestJS 10
- **数据库**: PostgreSQL + TypeORM
- **缓存**: Redis（ioredis）
- **文档**: Swagger/OpenAPI
- **其他**: dayjs、uuid、class-validator

### 前端
- **框架**: React 18 + TypeScript
- **UI组件**: Ant Design 5 + Pro Components
- **构建工具**: Vite 5
- **路由**: React Router v6
- **HTTP**: Axios
- **日期处理**: dayjs

## 项目结构

```
.
├── backend/                    # NestJS 后端
│   ├── src/
│   │   ├── common/             # 公共服务（Redis）
│   │   ├── config/             # 配置文件
│   │   ├── modules/
│   │   │   ├── pond/           # 池塘管理模块
│   │   │   ├── medication/     # 用药管理模块
│   │   │   ├── batch/          # 批次管理模块
│   │   │   └── workorder/      # 设备工单模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/                   # React 前端
    ├── src/
    │   ├── layouts/            # 布局组件
    │   ├── pages/              # 页面组件
    │   │   ├── pond/
    │   │   ├── medication/
    │   │   ├── batch/
    │   │   └── workorder/
    │   ├── services/           # API 服务
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## 快速开始

### 前置要求

- Node.js >= 16
- PostgreSQL >= 13
- Redis >= 6

### 1. 启动 PostgreSQL 和 Redis

```bash
# 使用 Docker 快速启动
docker run -d --name aqua-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=aquaculture \
  -p 5432:5432 postgres:14

docker run -d --name aqua-redis -p 6379:6379 redis:7
```

### 2. 启动后端服务

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 根据实际情况修改 .env 中的数据库和 Redis 配置

# 启动开发服务
npm run start:dev
```

后端服务启动后访问:
- API 服务: http://localhost:3000
- Swagger 文档: http://localhost:3000/api

### 3. 启动前端服务

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务
npm run dev
```

前端服务启动后访问: http://localhost:5173

## API 接口速览

### 池塘管理 `/pond`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/pond` | 获取池塘列表 |
| GET | `/pond/:id` | 获取池塘详情 |
| POST | `/pond` | 创建池塘 |
| PUT | `/pond/:id` | 更新池塘 |
| DELETE | `/pond/:id` | 删除池塘 |
| POST | `/pond/water-quality` | 录入水质数据 |
| GET | `/pond/:pondId/water-quality` | 查询水质记录 |
| POST | `/pond/mortality` | 录入死亡率 |
| GET | `/pond/:pondId/sensor/latest` | 获取传感器最新数据 |
| GET | `/pond/:pondId/sensor/check-do` | 检查溶氧是否连续偏低 |

### 用药管理 `/medication`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/medication/medicines` | 获取药品列表（默认过滤禁用药） |
| POST | `/medication/medicines` | 创建药品档案 |
| GET | `/medication/plans` | 获取用药方案列表 |
| POST | `/medication/plans` | 开具用药方案（**自动校验禁用药**） |
| PUT | `/medication/plans/:id/complete` | 标记方案完成 |
| PUT | `/medication/plans/:id/cancel` | 取消用药方案 |
| GET | `/medication/withdrawal/check/:pondId` | 检查池塘停药期 |

### 批次管理 `/batch`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/batch/list` | 获取养殖批次列表 |
| POST | `/batch/create` | 创建养殖批次 |
| GET | `/batch/sales/list` | 获取销售批次列表 |
| POST | `/batch/sales/create` | 创建销售批次（**停药期校验，未满则拒绝**） |
| PUT | `/batch/sales/:id/release` | 放行销售批次（质检员确认） |
| PUT | `/batch/sales/:id/reject` | 驳回销售批次 |
| GET | `/batch/pre-check/withdrawal` | 预检停药期是否满足出塘条件 |

### 设备工单 `/workorder`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/workorder/list` | 获取工单列表 |
| POST | `/workorder/create` | 人工创建工单 |
| POST | `/workorder/aerator/check/:pondId` | 检查溶氧偏低自动生成增氧工单 |
| PUT | `/workorder/:id/start` | 开始处理工单 |
| PUT | `/workorder/:id/complete` | 完成工单 |
| GET | `/workorder/stats/summary` | 获取工单统计 |

## 核心业务规则

### 🔴 禁用药管控
- 药品档案中可标记 `isBanned: true`
- 开具用药方案时自动检查，禁用药直接抛出错误并拒绝开具

### 🟡 停药期管控
- 每种药品配置 `withdrawalPeriodDays`（停药期天数）
- 用药方案的 `withdrawalEndDate` = 用药结束日期 + 停药期天数
- **生成销售批次前自动检查**：池塘当前所有进行中的用药方案，其停药截止日期必须早于出塘日期
- 提供预检接口，可提前检查某个日期是否可出塘

### 🟢 增氧设备自动工单
- 录入水质数据时，若溶氧值低于阈值（默认 5mg/L），前端可触发自动工单检查
- 后端检查 Redis 中最近 3 条传感器历史记录，若连续偏低则自动创建增氧设备工单
- 30 分钟内同一池塘不会重复创建待处理的增氧工单

## 默认数据初始化

首次启动后，可通过 Swagger 或前端界面创建测试数据：
1. 创建池塘档案
2. 创建药品档案（部分标记为禁用药）
3. 录入水质数据（触发溶氧检查）
4. 开具用药方案（验证禁用药校验）
5. 创建养殖批次
6. 创建销售批次（验证停药期校验）

## 开发说明

- 后端采用模块化结构，每个业务域独立 Module
- 前端 API 调用统一封装在 `src/services/` 目录下
- TypeORM 配置 `synchronize: true`，启动时自动建表（生产环境请关闭）
