/**
 * WMS 业务字典（前端本地字典）
 * 后端就绪后可切换为 /wms/system/dict 接口下发，页面代码无需变更（仅需替换取值处）。
 * tag 为 el-tag 的 type：'' | 'success' | 'warning' | 'danger' | 'info'
 */
export interface DictItem {
  label: string;
  value: string | number;
  tag?: "" | "success" | "warning" | "danger" | "info";
}

/** 由字典值取 label */
export function dictLabel(options: DictItem[], value: any): string {
  const hit = options.find(o => String(o.value) === String(value));
  return hit ? hit.label : (value ?? "-");
}

/** 由字典值取 tag 类型 */
export function dictTag(options: DictItem[], value: any) {
  const hit = options.find(o => String(o.value) === String(value));
  return hit?.tag ?? "info";
}

// ========================= 通用 =========================

/** 用户状态 */
export const userStatusOptions: DictItem[] = [
  { label: "启用", value: 1, tag: "success" },
  { label: "停用", value: 0, tag: "danger" }
];

/** 通用单据状态（草稿-审核-执行-完成） */
export const docStatusOptions: DictItem[] = [
  { label: "草稿", value: "draft", tag: "info" },
  { label: "待审核", value: "pending", tag: "warning" },
  { label: "已审核", value: "approved", tag: "primary" },
  { label: "执行中", value: "processing", tag: "primary" },
  { label: "已完成", value: "finished", tag: "success" },
  { label: "已取消", value: "cancelled", tag: "danger" }
];

// ========================= 主数据 =========================

/** 库区类型 */
export const zoneTypeOptions: DictItem[] = [
  { label: "收货区", value: "receiving" },
  { label: "存储区", value: "storage" },
  { label: "拣货区", value: "picking" },
  { label: "暂存区", value: "buffer" },
  { label: "发货区", value: "shipping" },
  { label: "退货区", value: "return" },
  { label: "不合格品区", value: "reject" },
  { label: "加工区", value: "process" }
];

/** 库位类型 */
export const locationTypeOptions: DictItem[] = [
  { label: "地堆位", value: "floor", tag: "info" },
  { label: "货架位", value: "shelf" },
  { label: "立库位", value: "stereo", tag: "warning" },
  { label: "拣货位", value: "pick", tag: "success" },
  { label: "缓存位", value: "cache", tag: "info" }
];

/** 物料分类 */
export const materialCategoryOptions: DictItem[] = [
  { label: "原材料", value: "raw" },
  { label: "半成品", value: "semi" },
  { label: "成品", value: "finished" },
  { label: "包材", value: "packing" },
  { label: "耗材", value: "consumable" },
  { label: "备品备件", value: "spare" }
];

/** 容器类型 */
export const containerTypeOptions: DictItem[] = [
  { label: "托盘", value: "pallet" },
  { label: "周转箱", value: "box" },
  { label: "料箱", value: "bin" },
  { label: "笼车", value: "cage" }
];

/** 容器状态 */
export const containerStatusOptions: DictItem[] = [
  { label: "空闲", value: "idle", tag: "info" },
  { label: "占用", value: "occupied", tag: "primary" },
  { label: "在库", value: "instock", tag: "success" },
  { label: "发运", value: "shipping", tag: "warning" },
  { label: "报废", value: "scrapped", tag: "danger" }
];

// ========================= 入库 =========================

/** 入库单类型 */
export const inboundTypeOptions: DictItem[] = [
  { label: "采购入库", value: "purchase" },
  { label: "退货入库", value: "return" },
  { label: "调拨入库", value: "transfer" },
  { label: "盘盈入库", value: "gain" },
  { label: "其他入库", value: "other" }
];

/** 入库单状态 */
export const inboundStatusOptions: DictItem[] = [
  { label: "待审核", value: "pending", tag: "warning" },
  { label: "待到货", value: "waiting", tag: "info" },
  { label: "收货中", value: "receiving", tag: "primary" },
  { label: "待质检", value: "qc", tag: "warning" },
  { label: "待上架", value: "putaway", tag: "warning" },
  { label: "已完成", value: "finished", tag: "success" },
  { label: "已取消", value: "cancelled", tag: "danger" }
];

/** 质检结果 */
export const qcResultOptions: DictItem[] = [
  { label: "待检", value: "waiting", tag: "warning" },
  { label: "合格", value: "pass", tag: "success" },
  { label: "不合格", value: "fail", tag: "danger" },
  { label: "让步接收", value: "concession", tag: "warning" }
];

// ========================= 出库 =========================

/** 出库单类型 */
export const outboundTypeOptions: DictItem[] = [
  { label: "销售出库", value: "sales" },
  { label: "调拨出库", value: "transfer" },
  { label: "领用出库", value: "internal" },
  { label: "报废出库", value: "scrap" },
  { label: "其他出库", value: "other" }
];

/** 出库单状态 */
export const outboundStatusOptions: DictItem[] = [
  { label: "待审核", value: "pending", tag: "warning" },
  { label: "待分配", value: "allocating", tag: "info" },
  { label: "待拣货", value: "picking_wait", tag: "info" },
  { label: "拣货中", value: "picking", tag: "primary" },
  { label: "待复核", value: "review", tag: "warning" },
  { label: "待发货", value: "shipping_wait", tag: "warning" },
  { label: "已发货", value: "shipped", tag: "success" },
  { label: "已完成", value: "finished", tag: "success" },
  { label: "已取消", value: "cancelled", tag: "danger" },
  { label: "缺货", value: "stockout", tag: "danger" }
];

/** 优先级 */
export const priorityOptions: DictItem[] = [
  { label: "紧急", value: "urgent", tag: "danger" },
  { label: "高", value: "high", tag: "warning" },
  { label: "普通", value: "normal", tag: "info" },
  { label: "低", value: "low", tag: "info" }
];

// ========================= 库存 =========================

/** 库存状态 */
export const stockStatusOptions: DictItem[] = [
  { label: "合格", value: "qualified", tag: "success" },
  { label: "待检", value: "inspecting", tag: "warning" },
  { label: "冻结", value: "frozen", tag: "danger" },
  { label: "不合格", value: "unqualified", tag: "danger" }
];

/** 移库类型 */
export const moveTypeOptions: DictItem[] = [
  { label: "库位移库", value: "location" },
  { label: "容器移库", value: "container" },
  { label: "仓库调拨", value: "transfer" }
];

/** 盘点状态 */
export const stocktakeStatusOptions: DictItem[] = [
  { label: "草稿", value: "draft", tag: "info" },
  { label: "盘点中", value: "counting", tag: "primary" },
  { label: "待处理差异", value: "diff", tag: "warning" },
  { label: "已完成", value: "finished", tag: "success" },
  { label: "已取消", value: "cancelled", tag: "danger" }
];

/** 盘点方式 */
export const stocktakeModeOptions: DictItem[] = [
  { label: "全盘", value: "full" },
  { label: "循环盘点", value: "cycle" },
  { label: "抽盘", value: "spot" },
  { label: "动碰盘点", value: "moving" }
];

/** 库存事务类型（流水） */
export const transactionTypeOptions: DictItem[] = [
  { label: "收货入库", value: "receive", tag: "success" },
  { label: "上架入库", value: "putaway", tag: "success" },
  { label: "销售出库", value: "sales", tag: "danger" },
  { label: "调拨出库", value: "transfer_out", tag: "danger" },
  { label: "调拨入库", value: "transfer_in", tag: "success" },
  { label: "移库", value: "move", tag: "primary" },
  { label: "补货", value: "replenish", tag: "primary" },
  { label: "盘点调整", value: "stocktake", tag: "warning" },
  { label: "报溢", value: "gain", tag: "success" },
  { label: "报损", value: "loss", tag: "danger" },
  { label: "冻结", value: "freeze", tag: "warning" },
  { label: "解冻", value: "unfreeze", tag: "success" }
];

/** 预警类型 */
export const warningTypeOptions: DictItem[] = [
  { label: "低于安全库存", value: "low", tag: "danger" },
  { label: "超储", value: "over", tag: "warning" },
  { label: "呆滞库存", value: "dead", tag: "info" },
  { label: "临期", value: "expiring", tag: "warning" },
  { label: "已过期", value: "expired", tag: "danger" }
];

/** 序列号状态 */
export const serialStatusOptions: DictItem[] = [
  { label: "在库", value: "instock", tag: "success" },
  { label: "已分配", value: "allocated", tag: "warning" },
  { label: "已出库", value: "outbound", tag: "info" },
  { label: "已报废", value: "scrapped", tag: "danger" },
  { label: "维修中", value: "repairing", tag: "warning" }
];

// ========================= 库内作业 =========================

/** 任务类型 */
export const taskTypeOptions: DictItem[] = [
  { label: "收货", value: "receive" },
  { label: "质检", value: "qc" },
  { label: "上架", value: "putaway" },
  { label: "补货", value: "replenish" },
  { label: "拣货", value: "picking" },
  { label: "复核", value: "review" },
  { label: "移库", value: "move" },
  { label: "盘点", value: "stocktake" }
];

/** 任务状态 */
export const taskStatusOptions: DictItem[] = [
  { label: "待分配", value: "pending", tag: "info" },
  { label: "执行中", value: "processing", tag: "primary" },
  { label: "已完成", value: "finished", tag: "success" },
  { label: "已取消", value: "cancelled", tag: "danger" },
  { label: "异常", value: "error", tag: "danger" }
];

// ========================= 运输 =========================

/** 承运商类型 */
export const carrierTypeOptions: DictItem[] = [
  { label: "自有车队", value: "self" },
  { label: "第三方物流", value: "third" }
];

/** 配送单状态 */
export const deliveryStatusOptions: DictItem[] = [
  { label: "待调度", value: "pending", tag: "info" },
  { label: "已调度", value: "dispatched", tag: "primary" },
  { label: "配送中", value: "delivering", tag: "warning" },
  { label: "已签收", value: "signed", tag: "success" },
  { label: "异常", value: "error", tag: "danger" }
];

// ========================= 计费 =========================

/** 费用类型 */
export const feeTypeOptions: DictItem[] = [
  { label: "仓储费", value: "storage" },
  { label: "操作费", value: "operation" },
  { label: "装卸费", value: "handling" },
  { label: "耗材费", value: "material" },
  { label: "运输费", value: "transport" }
];

/** 账单状态 */
export const billStatusOptions: DictItem[] = [
  { label: "待确认", value: "pending", tag: "warning" },
  { label: "已确认", value: "confirmed", tag: "primary" },
  { label: "已开票", value: "invoiced", tag: "success" },
  { label: "已结算", value: "settled", tag: "success" },
  { label: "异议中", value: "disputed", tag: "danger" }
];

// ========================= 设备集成 =========================

/** 设备类型 */
export const deviceTypeOptions: DictItem[] = [
  { label: "AGV 小车", value: "agv" },
  { label: "堆垛机", value: "stacker" },
  { label: "输送线", value: "conveyor" },
  { label: "电子标签", value: "ptl" },
  { label: "分拣机", value: "sorter" },
  { label: "自动库门", value: "door" }
];

/** 设备状态 */
export const deviceStatusOptions: DictItem[] = [
  { label: "在线", value: "online", tag: "success" },
  { label: "离线", value: "offline", tag: "info" },
  { label: "故障", value: "error", tag: "danger" },
  { label: "维修中", value: "repairing", tag: "warning" },
  { label: "充电中", value: "charging", tag: "warning" },
  { label: "作业中", value: "working", tag: "primary" }
];

/** 设备任务状态 */
export const deviceTaskStatusOptions: DictItem[] = [
  { label: "排队中", value: "queued", tag: "info" },
  { label: "执行中", value: "executing", tag: "primary" },
  { label: "已完成", value: "finished", tag: "success" },
  { label: "失败", value: "failed", tag: "danger" },
  { label: "已取消", value: "cancelled", tag: "info" }
];

/** 集成系统类型 */
export const integrationTypeOptions: DictItem[] = [
  { label: "ERP", value: "erp" },
  { label: "OMS", value: "oms" },
  { label: "TMS", value: "tms" },
  { label: "WCS 设备层", value: "wcs" },
  { label: "电商平台", value: "ecom" }
];

/** 接口方向 */
export const apiDirectionOptions: DictItem[] = [
  { label: "下行（外部→WMS）", value: "down" },
  { label: "上行（WMS→外部）", value: "up" }
];

/** 接口状态 */
export const apiLogStatusOptions: DictItem[] = [
  { label: "成功", value: "success", tag: "success" },
  { label: "失败", value: "fail", tag: "danger" },
  { label: "重试中", value: "retry", tag: "warning" }
];
