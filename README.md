# 🍳 欢乐餐厅 - 网页版经营小游戏

基于 SpringBoot 3 + Vue 3 + MySQL 5.7 + ElementPlus 开发的餐厅经营模拟游戏。
Canvas绘制餐厅场景，动态顾客动画，童趣风格UI。

## 项目结构

```
RestaurantManagement/
├── backend/                   # SpringBoot 3 后端
│   └── src/main/java/com/restaurant/
│       ├── common/            # 统一响应封装
│       ├── config/            # 跨域配置
│       ├── controller/        # 控制器(用户、存档)
│       ├── entity/            # 实体类
│       ├── mapper/            # MyBatis Mapper
│       └── service/           # 业务逻辑层
├── frontend/                  # Vue 3 前端
│   └── src/
│       ├── api/               # 后端接口封装
│       ├── components/        # 组件(HUD、Canvas、菜品管理)
│       ├── game/              # 游戏引擎(engine/customer/restaurant)
│       ├── router/            # 路由配置
│       └── views/             # 页面(登录、游戏主界面)
└── README.md
```

## 核心功能

- **Canvas餐厅场景**：温暖木质风餐厅，桌椅、装饰物、柜台，精美绘制
- **顾客动画系统**：自动生成顾客 → 进店走动 → 落座点餐 → 用餐(进度条) → 结账(金币粒子) → 离店
- **菜品管理**：初始3道菜 + 金币解锁5道新菜品
- **金币经济**：顾客消费实时获得金币，粒子特效反馈
- **等级成长**：每服务10位顾客升级
- **存档系统**：一键保存/读取游戏进度
- **用户系统**：注册/登录

## 快速开始

### 1. 数据库

```sql
-- MySQL 5.7+，执行建表脚本
mysql -u root -p < backend/src/main/resources/schema.sql
```

### 2. 后端

```bash
cd backend
# 修改 src/main/resources/application.yml 中的数据库连接信息
mvn spring-boot:run
# 服务启动在 http://localhost:8080
```

### 3. 前端

```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:3000
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vite 5 |
| UI组件 | ElementPlus |
| 游戏渲染 | Canvas 2D |
| 状态管理 | Pinia |
| HTTP请求 | Axios |
| 后端框架 | SpringBoot 3.2 |
| ORM | MyBatis |
| 数据库 | MySQL 5.7 |

## 游戏玩法

1. 注册账号并登录
2. 进入游戏后顾客自动进店落座点餐
3. 观察顾客用餐进度，用餐完毕自动结账获得金币
4. 在右侧面板用金币解锁新菜品(更多菜品=更多收入)
5. 每服务10位顾客餐厅升级
6. 随时点击"存档"保存进度
