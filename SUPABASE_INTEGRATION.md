# Supabase 整合配置指南

## 📋 整合概述

本项目已完成与 Supabase 平台的全面整合，包括：
- 数据库连接配置
- 用户认证系统对接
- API 接口适配
- 权限控制体系
- 实时数据同步

---

## 🔧 环境配置

### 1. 获取 Supabase 凭证

登录 Supabase 控制台，创建新项目后获取以下信息：

| 配置项 | 获取位置 | 说明 |
|--------|----------|------|
| `DATABASE_URL` | Settings > Database > Connection string | 主数据库连接URL |
| `SHADOW_DATABASE_URL` | Settings > Database > Connection string | 影子数据库（用于迁移） |
| `NEXT_PUBLIC_SUPABASE_URL` | Settings > API > URL | API 端点 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings > API > Anon public | 匿名访问密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings > API > Service Role | 服务端密钥 |

### 2. 更新 .env 文件

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
SHADOW_DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"
```

---

## 🚀 部署步骤

### 1. 安装依赖

```bash
npm install
npm install @supabase/supabase-js
```

### 2. 运行数据库迁移

通过 Supabase SQL 编辑器执行以下迁移脚本：

```sql
-- 执行 supabase/migrations/20240101000000_initial_schema.sql
-- 执行 supabase/migrations/20240101000001_enable_rls.sql
```

### 3. 启用认证方式

在 Supabase 控制台启用以下认证方式：
- Email/Password（邮箱密码登录）
- 可选：Google、GitHub 等 OAuth 提供商

### 4. 配置存储（可选）

如需用户头像上传功能，在 Supabase Storage 创建 `avatars` bucket。

---

## 🔐 安全策略

### 行级安全（RLS）

所有表已启用 RLS，策略如下：

| 表名 | 策略 | 说明 |
|------|------|------|
| `user_profiles` | 用户只能访问自己的记录 | `id = auth.uid()::TEXT` |
| `habits` | 用户只能访问自己的习惯 | `user_id = auth.uid()::TEXT` |
| `habit_logs` | 用户只能访问自己的日志 | `user_id = auth.uid()::TEXT` |

### 安全最佳实践

1. **匿名密钥限制**：仅用于客户端只读操作
2. **服务端密钥保护**：存储在环境变量中，绝不暴露给客户端
3. **密码加密**：使用 bcrypt 算法，成本因子 ≥ 10
4. **HTTPS 强制**：所有请求通过 HTTPS
5. **SQL 注入防护**：使用 Supabase 参数化查询

---

## 📡 API 接口

### 认证接口

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/logout` | 用户退出 |

### 习惯接口

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/habits` | 获取用户习惯列表 |
| POST | `/api/habits` | 创建新习惯 |
| GET | `/api/habits/:id` | 获取习惯详情 |
| PUT | `/api/habits/:id` | 更新习惯 |
| DELETE | `/api/habits/:id` | 删除习惯 |

### 日志接口

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/completions` | 打卡记录 |
| DELETE | `/api/completions` | 取消打卡 |
| GET | `/api/stats/:userId` | 获取统计数据 |

---

## 🔄 实时数据同步

### 使用方式

```typescript
import { subscribeToHabits, subscribeToLogs } from '@/services/habitService'

// 订阅习惯变化
const habitChannel = await subscribeToHabits(userId, (habits) => {
  console.log('Habits updated:', habits)
})

// 订阅日志变化
const logChannel = await subscribeToLogs(userId, (logs) => {
  console.log('Logs updated:', logs)
})

// 取消订阅
habitChannel.unsubscribe()
logChannel.unsubscribe()
```

---

## 🧪 测试指南

### 功能测试

#### 1. 用户认证测试

```bash
# 注册用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'

# 登录用户
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

#### 2. 习惯 CRUD 测试

```bash
# 创建习惯
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"user_id": "[USER_ID]", "name": "早起跑步", "icon": "🏃", "color": "#EF4444"}'

# 获取习惯列表
curl -X GET "http://localhost:3000/api/habits?userId=[USER_ID]" \
  -H "Authorization: Bearer [TOKEN]"

# 更新习惯
curl -X PUT http://localhost:3000/api/habits/[HABIT_ID] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"name": "晨跑"}'

# 删除习惯
curl -X DELETE http://localhost:3000/api/habits/[HABIT_ID] \
  -H "Authorization: Bearer [TOKEN]"
```

#### 3. 打卡测试

```bash
# 打卡
curl -X POST http://localhost:3000/api/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"habit_id": "[HABIT_ID]", "user_id": "[USER_ID]"}'
```

### 性能测试

使用 `k6` 进行压力测试：

```javascript
// test/load-test.js
import http from 'k6/http'
import { sleep } from 'k6'

export const options = {
  vus: 100,
  duration: '30s',
}

export default function () {
  http.get('http://localhost:3000/api/habits?userId=test-user')
  sleep(1)
}
```

运行测试：
```bash
k6 run test/load-test.js
```

### 安全测试

| 测试项 | 方法 | 预期结果 |
|--------|------|----------|
| 未授权访问 | 不带 token 请求 API | 返回 401 错误 |
| 越权访问 | 使用 A 用户 token 访问 B 用户数据 | 返回 403 或空数据 |
| SQL 注入 | 传入恶意 SQL | 被安全过滤 |
| 密码强度 | 注册弱密码 | 返回验证错误 |

---

## 📊 监控与日志

### Supabase 监控

在 Supabase 控制台监控：
- **数据库性能**：查询执行时间、连接数
- **API 调用**：请求次数、响应时间
- **认证日志**：登录尝试、失败记录

### 错误日志

应用层错误记录到 `debug.log`：
```bash
tail -f debug.log
```

---

## 🔧 故障排除

### 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 连接超时 | 网络问题 | 检查网络连接，验证数据库 URL |
| 权限错误 | RLS 策略问题 | 检查用户认证状态，验证 RLS 策略 |
| 数据不同步 | 实时订阅问题 | 检查 channel 订阅状态 |
| 迁移失败 | 数据库权限 | 使用服务角色密钥执行迁移 |

### 调试命令

```bash
# 检查数据库连接
npx prisma studio

# 验证 Supabase 配置
curl -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/habits?select=*"
```

---

## 📝 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2024-01-01 | 初始整合完成 |
| 1.1 | 2024-01-15 | 添加 RLS 策略 |
| 1.2 | 2024-02-01 | 实现实时同步 |