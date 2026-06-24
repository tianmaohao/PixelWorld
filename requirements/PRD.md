# PixelWorld - 拼豆像素图案生成器 产品需求文档

## 1. 项目概述

### 1.1 项目背景
**PixelWorld** 是一个面向拼豆（Perler Beads/Fuse Beads）爱好者的在线工具和社区平台。拼豆是一种通过将彩色豆子拼在模板上并用熨斗加热熔合，制作像素风格图案的手工艺术。每个豆子就像一个像素点，组合后形成精美的像素画作品。

### 1.2 目标用户
- 拼豆爱好者（初学者到高手）
- 像素画创作者
- 手工DIY爱好者
- 儿童及家长（亲子手工）

### 1.3 核心价值
- 为用户提供便捷的像素图案转换工具，帮助用户快速创建拼豆模版
- 建立活跃的拼豆创作者社区，分享和交流作品
- 降低拼豆创作门槛，让新手也能轻松上手

---

## 2. 功能模块

### 2.1 用户系统

#### 2.1.1 注册/登录
- **账号注册**：支持邮箱注册、用户名+密码
- **第三方登录**：微信、QQ、GitHub（OAuth 2.0）
- **游客模式**：可使用基础功能，但无法保存和发布

#### 2.1.2 用户资料
- 头像、昵称、个人简介
- 个人主页展示（作品集、收藏、关注/粉丝）

---

### 2.2 图片转换核心功能

#### 2.2.1 上传图片
- **支持格式**：JPG、PNG、GIF、WebP
- **文件限制**：最大 10MB
- **图片预览**：上传后即时预览原图

#### 2.2.2 像素风格转换算法
支持多种预设风格：

| 风格名称 | 描述 | 豆子数量 |
|---------|------|---------|
| 经典像素 | 标准29x29网格 | 841颗 |
| 大尺寸 | 58x58网格 | 3,364颗 |
| 超大尺寸 | 116x116网格 | 13,456颗 |
| 圆形模版 | 圆形排列 | 按尺寸定 |
| 心形模版 | 心形排列 | 按尺寸定 |

#### 2.2.3 转换参数调节
- **颜色数量**：16/32/64/128/256色（有限调色盘更接近真实拼豆）
- **亮度**：-50% ~ +50%
- **对比度**：-50% ~ +50%
- **饱和度**：-50% ~ +50%
- **模糊**：0~10px（减少噪点）
- **抖动算法**：无/Floyd-Steinberg/Atkinson（优化渐变效果）

#### 2.2.4 调色盘映射
支持常见拼豆品牌调色盘：
- **Artkal S系列**（2.6mm）
- **Artkal R系列**（5mm）
- **Perler Beads**
- **Hama Beads**

#### 2.2.5 导出功能
- **像素预览图**：PNG格式，显示网格和豆子位置
- **拼豆模版图**：带编号的模版，显示每个位置的颜色编号
- **纯色块图**：不含网格，用于打印
- **PDF模版**：可打印的A4尺寸模版，包含：
  - 图案预览
  - 颜色对照表（颜色名称+编号）
  - 网格坐标

---

### 2.3 编辑器功能

#### 2.3.1 绘图工具

##### 画笔工具
- 点击/拖动为像素着色
- 支持当前选中的颜色
- 画笔大小：1x1像素
- 按住Shift可绘制直线

##### 橡皮擦工具
- 点击/拖动擦除像素颜色
- 擦除后像素变为透明/背景色
- 支持橡皮擦大小调节（1x1, 2x2, 3x3）

##### 取色器工具
- 点击画布上的像素，吸取该像素颜色
- 吸取的颜色自动设置为当前画笔颜色
- 支持吸取任意位置像素（包括透明区域外）
- 按住Alt键临时切换为取色器模式

##### 填充工具（油漆桶）
- 点击封闭区域进行颜色填充
- 支持容差值设置（0-100%）
- 支持连续/非连续填充模式

##### 移动/缩放
- **画布移动**：按住空格键+拖动，或鼠标中键拖动
- **缩放**：
  - 滚轮缩放（以鼠标位置为中心）
  - 触控板双指缩放
  - 缩放范围：10% - 800%
  - 双击画布快速缩放到100%
- **适应窗口**：一键将画布适应到窗口大小
- **平滑渲染**：缩放时保持像素边缘清晰（pixelated渲染）

#### 2.3.2 历史记录系统

##### 撤销/重做
- **撤销**：支持最多100步操作历史
- **重做**：已撤销的操作可恢复
- **快捷键**：
  - Windows: Ctrl+Z (撤销), Ctrl+Shift+Z / Ctrl+Y (重做)
  - Mac: Cmd+Z (撤销), Cmd+Shift+Z (重做)
- **操作记录**：
  - 每次画笔/橡皮操作记录为一个原子操作
  - 连续绘制（按住鼠标拖动）合并为一个操作
  - 颜色切换不记录为独立操作
- **历史面板**（可选）：
  - 显示操作历史列表
  - 可点击跳转到任意历史状态

#### 2.3.3 调色盘系统

##### 预设调色盘
- 内置主流拼豆品牌色卡：
  - Artkal S系列（2.6mm）- 约200+颜色
  - Artkal R系列（5mm）- 约200+颜色
  - Perler Beads - 约100+颜色
  - Hama Beads - 约100+颜色
- 按色系分组（红、橙、黄、绿、蓝、紫、棕、黑/白/灰）

##### 自定义调色盘
- **添加颜色**：
  - 从色盘中选择颜色添加
  - 通过HEX/RGB/HSL输入精确颜色
  - 使用取色器从画布吸取颜色
- **管理颜色**：
  - 自定义颜色分组/标签
  - 删除自定义颜色
  - 导入/导出调色盘（JSON格式）
- **颜色信息显示**：
  - 悬浮显示颜色名称、HEX、RGB值
  - 显示对应的拼豆编号（如有）

##### 调色盘布局
- 网格布局显示颜色块
- 支持切换紧凑/宽松显示模式
- 颜色块大小：20x20px - 40x40px可调

#### 2.3.4 图层系统（可选高级功能）
- 支持多图层
- 图层显隐、锁定、透明度
- 图层合并、排序

#### 2.3.5 辅助功能
- 网格线开关
- 网格线颜色/粗细可调
- 颜色高亮（选择某颜色时高亮所有该颜色豆子）
- 像素坐标显示
- 当前颜色信息显示

---

### 2.4 导出功能（全局）

> **重要**：导出功能从编辑器和图片转换模块解耦，作为全局功能独立存在。用户无论是在图片转换后，还是在编辑器中创作/修改后，都可以使用统一的导出功能。

#### 2.4.1 导出入口
- **图片转换页面**：转换完成后显示"导出"按钮
- **编辑器页面**：工具栏常驻"导出"按钮
- **作品详情页**：已发布作品支持下载模版

#### 2.4.2 导出格式

##### 图片格式
| 格式 | 用途 | 特点 |
|-----|------|-----|
| PNG | 预览图、打印 | 无损，支持透明 |
| JPG | 分享、预览 | 有损压缩，文件小 |
| SVG | 矢量编辑 | 可二次编辑 |
| WEBP | 网页分享 | 高压缩率 |

##### 模版格式
| 格式 | 内容 | 适用场景 |
|-----|------|---------|
| 像素预览图 | 网格+豆子位置 | 在线查看 |
| 拼豆模版图 | 带颜色编号 | 实际制作 |
| 纯色块图 | 无网格 | 打印参考 |
| PDF模版 | 完整模版+色卡 | 打印制作 |

#### 2.4.3 导出设置
- **尺寸选择**：
  - 原始尺寸（1:1）
  - 自定义倍数（2x, 3x, 4x）
  - 自定义像素尺寸
  
- **内容选项**：
  - [x] 包含网格线
  - [ ] 包含颜色编号
  - [ ] 包含坐标标注
  - [ ] 包含颜色对照表

- **PDF模版设置**：
  - 纸张大小（A4, A3, Letter）
  - 横向/纵向
  - 分页方式（单页/多页）

#### 2.4.4 导出流程
```
用户点击导出 → 选择导出格式 → 配置导出选项 → 预览效果 → 确认下载
```

#### 2.4.5 快速导出
- 一键导出为上次使用的格式
- 导出历史记录（最近5次）

---

### 2.5 社区功能

#### 2.5.1 作品发布
- **作品信息**：
  - 标题
  - 描述
  - 标签（最多10个）
  - 使用的调色盘品牌
  - 尺寸信息
  - 原图（可选）

- **作品图片**：
  - 成品效果图
  - 制作过程图（可选）

#### 2.5.2 作品浏览
- **发现页**：
  - 推荐作品（算法推荐）
  - 最新发布
  - 热门排行（按点赞/收藏数）
  - 精选合集

- **搜索功能**：
  - 按标题/描述搜索
  - 按标签搜索
  - 按作者搜索
  - 按风格分类

#### 2.5.3 社交互动
- **点赞**：喜欢作品
- **收藏**：保存到个人收藏夹
- **评论**：
  - 文字评论
  - 支持图片评论
  - 评论点赞
- **分享**：
  - 微博、微信、QQ分享
  - 生成分享海报

#### 2.5.4 关注系统
- 关注/取消关注创作者
- 关注动态推送

#### 2.5.5 下载他人作品
- 下载模版需要消耗积分（可通过签到/发布作品获取）
- 或通过VIP会员免费下载

---

### 2.6 用户中心

#### 2.6.1 我的作品
- 本地保存的未发布作品
- 已发布作品管理

#### 2.6.2 我的收藏
- 收藏的他人作品
- 收藏夹分组管理

#### 2.6.3 我的关注
- 关注的用户列表
- 粉丝列表

#### 2.6.4 消息中心
- 系统通知
- 评论/点赞/关注通知

---

### 2.7 会员与积分系统

#### 2.7.1 积分获取
- 每日签到：+5分
- 发布作品：+10分
- 作品被点赞：+1分
- 邀请新用户：+20分

#### 2.7.2 积分消耗
- 下载他人作品：-5分

#### 2.7.3 VIP会员（可选）
- 无限下载
- 高级导出格式
- 无广告
- 优先客服

---

## 3. 技术架构

### 3.1 前端技术栈
- **框架**：React / Vue 3
- **UI库**：Ant Design / Element Plus
- **Canvas库**：Fabric.js / Konva.js（像素编辑器）
- **图片处理**：Canvas API + WebAssembly（性能优化）
- **状态管理**：Redux / Pinia

### 3.2 后端技术栈
- **API服务**：Node.js (Nest.js) / Python (FastAPI)
- **图片处理**：Python PIL/OpenCV + Sharp(Node.js)
- **数据库**：PostgreSQL（主库）+ Redis（缓存）
- **存储**：阿里云OSS / AWS S3
- **消息队列**：RabbitMQ / Redis Queue

### 3.3 AI算法模块
- **颜色量化**：Median Cut / K-means聚类
- **抖动算法**：Floyd-Steinberg / Atkinson
- **边缘检测**：用于保持图案清晰度
- **智能缩放**：保留关键细节的降采样算法

---

## 4. 页面结构

```
├── 首页
│   ├── 轮播Banner
│   ├── 精选作品
│   ├── 快速开始
│   └── 最新发布
│
├── 图片转换
│   ├── 上传区域
│   ├── 参数调节面板
│   ├── 实时预览
│   └── 导出选项
│
├── 编辑器
│   ├── 顶部工具栏
│   │   ├── 绘图工具（画笔/橡皮/取色器/填充）
│   │   ├── 撤销/重做按钮
│   │   ├── 缩放控制
│   │   └── 全局导出按钮
│   ├── 左侧调色盘面板
│   │   ├── 品牌色卡选择
│   │   ├── 颜色网格
│   │   ├── 自定义颜色管理
│   │   └── 当前颜色信息
│   ├── 中央画布区域
│   │   ├── 像素网格画布
│   │   ├── 缩放/平移控制
│   │   └── 坐标/颜色信息显示
│   └── 右侧图层面板（可选）
│
├── 社区
│   ├── 发现（推荐/最新/热门）
│   ├── 搜索结果
│   ├── 作品详情页
│   └── 话题/标签页
│
├── 个人中心
│   ├── 我的作品
│   ├── 我的收藏
│   ├── 我的关注
│   └── 账号设置
│
└── 帮助
    ├── 使用教程
    ├── 常见问题
    └── 关于我们
```

---

## 5. UI/UX设计要求

### 5.1 设计风格
- **主色调**：活力橙色 (#FF6B35) + 清新绿 (#4ECDC4)
- **辅助色**：浅灰背景 (#F7F7F7)
- **风格**：扁平化 + 微质感，活泼可爱
- **图标**：使用豆子形状元素

### 5.2 响应式设计
- 桌面端（>1200px）
- 平板端（768-1200px）
- 移动端（<768px）

### 5.3 交互设计
- 拖拽上传图片
- 滑块实时预览参数效果
- 悬浮显示豆子颜色信息
- 双指缩放画布（移动端）
- 画布操作：
  - 滚轮缩放（以鼠标为中心）
  - 空格+拖动平移画布
  - 双击快速缩放到100%
  - 适应窗口一键适应
- 快捷键支持：
  - B: 画笔工具
  - E: 橡皮擦工具
  - I: 取色器工具
  - G: 填充工具
  - Ctrl+Z: 撤销
  - Ctrl+Shift+Z: 重做
  - Ctrl+E: 导出

---

## 6. 数据模型

### 6.1 用户表 (users)
```sql
id              SERIAL PRIMARY KEY
username        VARCHAR(50) UNIQUE NOT NULL
email           VARCHAR(100) UNIQUE
password_hash   VARCHAR(255)
avatar_url      VARCHAR(500)
bio             TEXT
points          INTEGER DEFAULT 0
is_vip          BOOLEAN DEFAULT false
created_at      TIMESTAMP DEFAULT NOW()
```

### 6.2 作品表 (projects)
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER REFERENCES users(id)
title           VARCHAR(100) NOT NULL
description     TEXT
tags            TEXT[]
style           VARCHAR(50) -- 像素风格
palette         VARCHAR(50) -- 调色盘品牌
width           INTEGER
height          INTEGER
bead_count      INTEGER
image_url       VARCHAR(500) -- 成品图
template_url    VARCHAR(500) -- 模版图
likes_count     INTEGER DEFAULT 0
downloads_count INTEGER DEFAULT 0
is_public       BOOLEAN DEFAULT true
created_at      TIMESTAMP DEFAULT NOW()
```

### 6.3 像素数据表 (pixel_data)
```sql
id              SERIAL PRIMARY KEY
project_id      INTEGER REFERENCES projects(id)
pixels          JSONB -- 像素坐标和颜色数据
bead_colors     JSONB -- 使用的颜色列表
```

### 6.4 评论表 (comments)
```sql
id              SERIAL PRIMARY KEY
project_id      INTEGER REFERENCES projects(id)
user_id         INTEGER REFERENCES users(id)
content         TEXT NOT NULL
parent_id       INTEGER REFERENCES comments(id) -- 回复
created_at      TIMESTAMP DEFAULT NOW()
```

### 6.5 点赞/收藏表 (likes/favorites)
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER REFERENCES users(id)
project_id      INTEGER REFERENCES projects(id)
created_at      TIMESTAMP DEFAULT NOW()
UNIQUE(user_id, project_id)
```

### 6.6 关注表 (follows)
```sql
id              SERIAL PRIMARY KEY
follower_id     INTEGER REFERENCES users(id)
following_id    INTEGER REFERENCES users(id)
created_at      TIMESTAMP DEFAULT NOW()
UNIQUE(follower_id, following_id)
```

---

## 7. API设计示例

### 7.1 图片转换
```
POST /api/convert
Content-Type: multipart/form-data

Request:
- image: File
- colors: number (16/32/64/128/256)
- style: string (classic/large/extra-large/circle/heart)
- brightness: number (-50 to 50)
- contrast: number (-50 to 50)
- saturation: number (-50 to 50)
- dither: string (none/floyd-steinberg/atkinson)
- palette: string (artkal-s/artkal-r/perler/hama)

Response:
{
  "success": true,
  "data": {
    "previewUrl": "string",
    "templateUrl": "string",
    "pixels": Array<{x, y, color}>,
    "beadColors": Array<{name, code, hex}>
  }
}
```

### 7.2 社区API
```
GET    /api/projects           -- 作品列表
GET    /api/projects/:id       -- 作品详情
POST   /api/projects           -- 发布作品
POST   /api/projects/:id/like  -- 点赞
POST   /api/projects/:id/fav   -- 收藏
GET    /api/projects/:id/comments -- 获取评论
POST   /api/projects/:id/comments -- 发表评论
GET    /api/users/:id/projects -- 用户作品
GET    /api/users/:id/favorites -- 用户收藏
```

### 7.3 导出API
```
POST   /api/export/image       -- 导出图片
POST   /api/export/template    -- 导出模版
POST   /api/export/pdf         -- 导出PDF
GET    /api/export/presets      -- 获取导出预设
POST   /api/export/save-preset -- 保存导出预设

Request (export/image):
{
  "pixels": Array<{x, y, color}>,
  "width": number,
  "height": number,
  "format": "png" | "jpg" | "svg" | "webp",
  "scale": number,  // 1, 2, 3, 4
  "options": {
    "includeGrid": boolean,
    "includeNumbers": boolean,
    "includeColorTable": boolean,
    "backgroundColor": string
  }
}
```

### 7.4 调色盘API
```
GET    /api/palettes              -- 获取预设调色盘列表
GET    /api/palettes/:brand       -- 获取品牌调色盘
GET    /api/palettes/custom       -- 获取用户自定义调色盘
POST   /api/palettes/custom       -- 添加自定义颜色
DELETE /api/palettes/custom/:id   -- 删除自定义颜色
POST   /api/palettes/import       -- 导入调色盘
GET    /api/palettes/export       -- 导出调色盘
```

---

## 8. 开发计划

### Phase 1 - MVP (4周)
- [x] 项目初始化
- [ ] 用户注册/登录
- [ ] 图片上传和基础转换
- [ ] 像素预览和下载
- [ ] 基础编辑器（画笔/橡皮/取色器）

### Phase 2 - 核心功能 (4周)
- [ ] 完整调色盘映射
- [ ] 多种导出格式（全局导出功能）
- [ ] 编辑器增强（撤销/重做、缩放平移、填充工具）
- [ ] 自定义调色盘系统
- [ ] 社区基础功能（发布/浏览）

### Phase 3 - 社区增强 (3周)
- [ ] 评论/点赞/收藏
- [ ] 关注系统
- [ ] 搜索功能
- [ ] 推荐算法

### Phase 4 - 商业化 (2周)
- [ ] 积分系统
- [ ] VIP会员
- [ ] 运营数据统计

---

## 9. 竞品分析

| 功能 | PixelWorld | Bead Studio | PixelStudio |
|-----|-----------|-------------|-------------|
| 图片转换 | ✅ | ✅ | ✅ |
| 多种风格 | ✅ | ❌ | ✅ |
| 调色盘映射 | ✅ | ✅ | ❌ |
| 在线编辑器 | ✅ | ✅ | ✅ |
| 画笔/橡皮 | ✅ | ✅ | ✅ |
| 取色器 | ✅ | ❌ | ✅ |
| 撤销/重做 | ✅(100步) | ✅(10步) | ✅(20步) |
| 画布缩放 | ✅(800%) | ✅(400%) | ✅(200%) |
| 自定义调色盘 | ✅ | ❌ | ❌ |
| 全局导出 | ✅ | ❌ | ❌ |
| 社区功能 | ✅ | ❌ | ✅ |
| PDF导出 | ✅ | ❌ | ✅ |
| 移动端适配 | ✅ | ❌ | 部分 |

---

## 10. 非功能需求

### 10.1 性能要求
- 图片转换响应时间：< 3秒
- 页面加载时间：< 2秒
- 图片预览生成：< 5秒
- 编辑器操作响应：< 16ms（60fps）
- 画布缩放/平移：无卡顿，流畅操作
- 撤销/重做响应：< 50ms
- 导出生成时间：< 10秒（根据尺寸和复杂度）

### 10.2 安全要求
- 用户密码加密存储
- 图片上传安全检测
- 接口限流（防止滥用）
- XSS/CSRF防护

### 10.3 可用性
- 支持主流浏览器（Chrome/Firefox/Safari/Edge）
- 99.9% 服务可用性

---

## 11. 附录

### 11.1 拼豆品牌颜色对照
（后续补充各品牌完整色卡数据）

### 11.2 像素风格参考
（收集常见像素画风格示例）

### 11.3 术语表
- **Perler Beads**：拼豆品牌名，也泛指此类手工
- **Fuse Beads**：熔融豆，拼豆的另一种称呼
- **Pixel Art**：像素画
- **Dithering**：抖动算法，用于在有限颜色下模拟渐变
- **Color Quantization**：颜色量化，将真彩色转为有限色
