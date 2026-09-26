# WMS 前端开发规范（基于 pure-admin 官方代码规范）

> 所有页面开发必须严格遵守本规范 + 三个示范页面的结构。禁止自行发明目录结构。
> **UI 规范**：设计系统见 `docs/UI设计规范.md`，全局皮肤在 `src/style/wms-theme.scss` 自动生效。
> 页面禁止写死状态颜色（走 `constants/wms.ts` 字典 tag）、禁止自建卡片阴影/圆角（用全局皮肤）、
> KPI 统计卡用 `wms-kpi-card` 类（参考 `views/welcome/index.vue`）。

## 一、页面目录结构（pure-admin 官方三件套）

```
src/views/<模块>/<页面>/
├── index.vue        # 页面壳：搜索表单 + PureTableBar + pure-table + 详情抽屉/明细弹窗
├── form.vue         # 有"新增/编辑"表单时才建：表单弹窗内容组件（配合 addDialog 使用）
└── utils/hook.tsx   # useXxx() Hook：所有逻辑（列配置、搜索、分页、CRUD、状态流转）
```

参考示范（严格模仿，不要重新发明）：
- `src/views/system/user/` —— 标准 CRUD 页（addDialog + form.vue）
- `src/views/inventory/ledger/` —— 查询型页面（详情抽屉，无新增/编辑）
- `src/views/inventory/stocktake/` —— 单据流转型页面（状态按钮 + 明细编辑弹窗）

## 二、代码规范

### 1. hook.tsx（页面逻辑全部在这里）
- 必须导出 `useXxx()` 组合式函数，`index.vue` 只负责模板渲染
- `search form` 状态命名为 `form`，用 `reactive`
- `columns: TableColumnList` 在 hook 内定义；自定义单元格优先用 `cellRenderer`（tsx JSX 写法），操作列/复杂模板用 `slot: "operation"` 等并在 index.vue 提供插槽
- 状态列 cellRenderer 用 `dictTag`/`dictLabel`（来自 `@/constants/wms`）渲染 el-tag
- 分页统一 `pagination = reactive({ pageSize: 10, currentPage: 1, total: 0 })`
- 事件统一 `onSearch / resetForm(formEl) / handleSizeChange / handleCurrentChange`
- `onMounted(() => onSearch())` 放 hook 内

### 2. form.vue（表单弹窗内容组件）
```ts
const props = defineProps<{ formInline: Partial<XxxItem> }>();
const formRef = ref();
// 关键：不解构、不 spread，保持对同一对象的引用，hook 的 beforeSure 才能拿到最新值
const newFormInline = reactive(props.formInline);
const rules: FormRules = { ... };
```

### 3. 弹窗（hook 内）
- **命名强制**：表单组件导入必须用 `formComp`，禁止与搜索表单状态 `form` 重名（否则运行时 `content` 传错对象、弹窗空白）：
  ```ts
  import formComp from "../form.vue";
  const form = reactive({ ... }); // 搜索表单
  ```
- 表单弹窗一律 `addDialog`（`import { addDialog } from "@/components/ReDialog"`，已全局挂载无需注册）：
  ```ts
  addDialog({
    title, width: "46%", draggable: true, closeOnClickModal: false,
    fullscreenIcon: "ep/full-screen",
    content: formComp,                // import formComp from "../form.vue"
    props: { formInline: {...} },
    beforeSure: (done, { options }) => {
      const formInline = (options.props as { formInline: Partial<XxxItem> }).formInline;
      // add or update，成功后 message + done() + onSearch()
    }
  });
  ```
- 二次确认 `ElMessageBox.confirm(...)`；成功提示 `message("xx成功", { type: "success" })`
  （`import { message } from "@/utils/message"`，**不要直接用 ElMessage**）

### 4. index.vue（页面壳）
- `defineOptions({ name: "XxxYyy" })` **必须与路由 name 一致**（keep-alive 依赖）
- 搜索表单 class：`search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto`，加 `ref="searchFormRef"`，重置按钮 `@click="resetForm(searchFormRef)"`
- 搜索表单每项加 `prop` 与 form 字段同名（resetFields 才生效）
- 图标统一：`import SearchIcon from "~icons/ep/search"`（**不带 ?raw**，得到组件）+ `useRenderIcon(SearchIcon)`；`useRenderIcon` 来自 `@/components/ReIcon/src/hooks`
- pure-table 通用属性：`border align-whole="center" row-key="id" show-overflow-tooltip adaptive :adaptiveConfig="{ offsetBottom: 120 }"`
- 底部 style 见示范页（search-form 的 el-form-item margin）

### 5. API 层（src/api/<module>.ts）
- 每个业务模块一个文件，顶部导出实体 interface，然后导出函数
- 命名：`getXxxPage / getXxxDetail / addXxx / updateXxx / deleteXxx / 业务动词`
- 统一签名：
  ```ts
  export const getXxxPage = (params?: PageQuery) =>
    http.request<ApiResult<PageResult<XxxItem>>>("get", "/wms/<模块>/<实体>/page", { params });
  export const addXxx = (data: Partial<XxxItem>) =>
    http.request<ApiResult<XxxItem>>("post", "/wms/<模块>/<实体>/add", { data });
  export const deleteXxx = (ids: number[]) =>
    http.request<ApiResult<boolean>>("post", "/wms/<模块>/<实体>/delete", { data: { ids } });
  ```
- 路径前缀统一 `/wms/...`；类型从 `./types` 引入 `ApiResult/PageQuery/PageResult`

### 6. mock（mock/<模块>.ts）
- 用工厂（`mock/_db.ts`）生成标准 CRUD：`crudRoutes({ prefix, seed, searchFields })`
- 种子数据用 `genRows/pick/randInt/pickDate/offsetStr/genCode` 生成，数据要真实、字段齐全、中文
- 自定义业务端点（审批/状态流转/执行等）手动写 `{ url, method: "post", response: ({ body }) => ok(...) }`，必要时同步修改种子数组
- `export default defineFakeRoute([ ...crudRoutes(...), ...自定义 ])`
- **禁止修改 mock/_db.ts 与其他模块的 mock 文件**

### 7. 字典
- 全部业务枚举在 `src/constants/wms.ts`，页面直接 `import { xxxOptions, dictLabel, dictTag }`
- 搜索下拉 `:value` 用字典 value（字符串枚举），不要硬编码中文

### 8. 禁止事项
- 禁止修改：路由文件、`src/router/**`、`src/utils/**`、`build/**`、`mock/_db.ts`、其他模块文件
- 禁止引入新依赖；需要图标用 `~icons/ep/xxx`（ep 集合图标齐全）
- 禁止用 ElMessage/ElNotification 代替 message 工具
- 禁止在 index.vue 写业务逻辑（只允许模板与少量展示型状态如 ref 引用、options 常量）
- 保持 prettier 风格：单引号、无分号、2 空格

## 三、通用种子数据口径（保持各 mock 一致）

- 仓库：`WH001 上海主仓`、`WH002 广州华南仓`、`WH003 成都西南仓`
- 货主：`货主A 华东电子`、`货主B 精工机械`、`货主C 日化用品`、`自营`
- 库区：`A 收货区 / B 存储区 / C 拣货区 / D 发货区`（库位如 `A-01-01`）
- 物料：`SKU00001~SKU00040`，名称参考 mock/inventory.ts
- 单号前缀：入库预约 ASN、收货 IN、质检 QC、上架 PA、退货 RT、出库 OUT、波次 WV、拣货 PK、复核 CK、配送 DP、移库 MV、调整 ADJ、盘点 PD、流水 TR、加工 PR、补货 RP、越库 XD

## 四、验证

写完每个模块后：不启动 dev/build（由主线程统一验证），但需保证导入路径正确、TS 类型完整（可运行 `npx vue-tsc --noEmit` 自查本模块涉及文件亦可忽略全局噪音）。
