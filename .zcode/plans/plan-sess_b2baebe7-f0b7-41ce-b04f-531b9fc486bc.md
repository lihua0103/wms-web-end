## 按已确认效果图 100% 还原登录页

### 改动文件（仅 3 个）
1. **`src/views/login/index.vue`** — 重写模板与 scoped 样式：
   - 左侧“态势舱”：品牌栏（logo + 系统名 + GLOBAL FULFILLMENT OS + 运行状态点）、徽章标语、大标题“让全球库存 / 开始协同。”、CSS 雷达仓网图（AI CORE 中心 + CN/SEA/EU/US 四节点 + 轨迹线 + 脉冲动画）、底部三组运营信号卡（38 在线节点 / 98.7% SLA / 12 待响应异常）、页脚链接。
   - 右侧“授权舱”：渐变描边玻璃卡片，SECURE GATE 状态行、欢迎标题、ACCOUNT/PASSWORD 分组表单、记住我 + 忘记密码、渐变主 CTA“进入全球控制塔 →”、协议勾选、加密提示、WORKSPACE/ONLINE 环境行、演示账号提示。
   - 保留：登录/防抖/回车提交、记住账号、协议校验、路由跳转、语言切换、明暗切换；`rule.ts` 不动。
   - 配色全部用 `--pure-theme-*` / `--el-*` + `color-mix` 派生，禁止硬编码色值；动画带 `prefers-reduced-motion` 降级。
2. **`src/locales/zh-CN.yaml`** — 重写 `login:` 段新文案（保留 rule.ts 依赖的 passwordRequired/passwordFormat 等全部在用 key）。
3. **`src/locales/en.yaml`** — 同步英文 `login:` 段，key 与中文一一对应。

### 验证
- 类型检查/构建通过。
- 启动 dev server，浏览器验证桌面/移动布局、中英切换、明暗主题、表单校验与登录跳转。