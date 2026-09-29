/**
 * WMS 业务字典（前端本地字典）
 * 后端就绪后可切换为 /wms/system/dict 接口下发，页面代码无需变更（仅需替换取值处）。
 * tag 为 el-tag 的 type：'' | 'success' | 'warning' | 'danger' | 'info'
 * label 走 i18n（src/locales/*.yaml 的 dict 分组），切换语言后整页刷新重建。
 */
import { $t } from "@/plugins/i18n";

export interface DictItem {
  label: string;
  value: string | number;
  tag?: "" | "primary" | "success" | "warning" | "danger" | "info";
}

/** 由字典值取 label */
export function dictLabel(options: DictItem[], value: any): string {
  const hit = options.find(o => String(o.value) === String(value));
  return hit ? hit.label : (value ?? "-");
}

/** 由字典值取 tag 类型（el-tag 的 type，不含空串） */
export function dictTag(
  options: DictItem[],
  value: any
): Exclude<DictItem["tag"], ""> {
  const hit = options.find(o => String(o.value) === String(value));
  return (hit?.tag || "info") as Exclude<DictItem["tag"], "">;
}

// ========================= 通用 =========================

/** 用户状态 */
export const userStatusOptions: DictItem[] = [
  { label: $t("dict.userStatus.1"), value: 1, tag: "success" },
  { label: $t("dict.userStatus.0"), value: 0, tag: "danger" }
];

/** 通用单据状态（草稿-审核-执行-完成） */
export const docStatusOptions: DictItem[] = [
  { label: $t("dict.docStatus.draft"), value: "draft", tag: "info" },
  { label: $t("dict.docStatus.pending"), value: "pending", tag: "warning" },
  { label: $t("dict.docStatus.approved"), value: "approved", tag: "primary" },
  {
    label: $t("dict.docStatus.processing"),
    value: "processing",
    tag: "primary"
  },
  { label: $t("dict.docStatus.finished"), value: "finished", tag: "success" },
  { label: $t("dict.docStatus.cancelled"), value: "cancelled", tag: "danger" }
];

// ========================= 主数据 =========================

/** 库区类型 */
export const zoneTypeOptions: DictItem[] = [
  { label: $t("dict.zoneType.receiving"), value: "receiving" },
  { label: $t("dict.zoneType.storage"), value: "storage" },
  { label: $t("dict.zoneType.picking"), value: "picking" },
  { label: $t("dict.zoneType.buffer"), value: "buffer" },
  { label: $t("dict.zoneType.shipping"), value: "shipping" },
  { label: $t("dict.zoneType.return"), value: "return" },
  { label: $t("dict.zoneType.reject"), value: "reject" },
  { label: $t("dict.zoneType.process"), value: "process" }
];

/** 库位类型 */
export const locationTypeOptions: DictItem[] = [
  { label: $t("dict.locationType.floor"), value: "floor", tag: "info" },
  { label: $t("dict.locationType.shelf"), value: "shelf" },
  { label: $t("dict.locationType.stereo"), value: "stereo", tag: "warning" },
  { label: $t("dict.locationType.pick"), value: "pick", tag: "success" },
  { label: $t("dict.locationType.cache"), value: "cache", tag: "info" }
];

/** 物料分类 */
export const materialCategoryOptions: DictItem[] = [
  { label: $t("dict.materialCategory.raw"), value: "raw" },
  { label: $t("dict.materialCategory.semi"), value: "semi" },
  { label: $t("dict.materialCategory.finished"), value: "finished" },
  { label: $t("dict.materialCategory.packing"), value: "packing" },
  { label: $t("dict.materialCategory.consumable"), value: "consumable" },
  { label: $t("dict.materialCategory.spare"), value: "spare" }
];

/** 容器类型 */
export const containerTypeOptions: DictItem[] = [
  { label: $t("dict.containerType.pallet"), value: "pallet" },
  { label: $t("dict.containerType.box"), value: "box" },
  { label: $t("dict.containerType.bin"), value: "bin" },
  { label: $t("dict.containerType.cage"), value: "cage" }
];

/** 容器状态 */
export const containerStatusOptions: DictItem[] = [
  { label: $t("dict.containerStatus.idle"), value: "idle", tag: "info" },
  {
    label: $t("dict.containerStatus.occupied"),
    value: "occupied",
    tag: "primary"
  },
  {
    label: $t("dict.containerStatus.instock"),
    value: "instock",
    tag: "success"
  },
  {
    label: $t("dict.containerStatus.shipping"),
    value: "shipping",
    tag: "warning"
  },
  {
    label: $t("dict.containerStatus.scrapped"),
    value: "scrapped",
    tag: "danger"
  }
];

// ========================= 入库 =========================

/** 入库单类型 */
export const inboundTypeOptions: DictItem[] = [
  { label: $t("dict.inboundType.purchase"), value: "purchase" },
  { label: $t("dict.inboundType.return"), value: "return" },
  { label: $t("dict.inboundType.transfer"), value: "transfer" },
  { label: $t("dict.inboundType.gain"), value: "gain" },
  { label: $t("dict.inboundType.other"), value: "other" }
];

/** 入库单状态 */
export const inboundStatusOptions: DictItem[] = [
  { label: $t("dict.inboundStatus.pending"), value: "pending", tag: "warning" },
  { label: $t("dict.inboundStatus.waiting"), value: "waiting", tag: "info" },
  {
    label: $t("dict.inboundStatus.receiving"),
    value: "receiving",
    tag: "primary"
  },
  { label: $t("dict.inboundStatus.qc"), value: "qc", tag: "warning" },
  { label: $t("dict.inboundStatus.putaway"), value: "putaway", tag: "warning" },
  {
    label: $t("dict.inboundStatus.finished"),
    value: "finished",
    tag: "success"
  },
  {
    label: $t("dict.inboundStatus.cancelled"),
    value: "cancelled",
    tag: "danger"
  }
];

/** 质检结果 */
export const qcResultOptions: DictItem[] = [
  { label: $t("dict.qcResult.waiting"), value: "waiting", tag: "warning" },
  { label: $t("dict.qcResult.pass"), value: "pass", tag: "success" },
  { label: $t("dict.qcResult.fail"), value: "fail", tag: "danger" },
  { label: $t("dict.qcResult.concession"), value: "concession", tag: "warning" }
];

// ========================= 出库 =========================

/** 出库单类型 */
export const outboundTypeOptions: DictItem[] = [
  { label: $t("dict.outboundType.sales"), value: "sales" },
  { label: $t("dict.outboundType.transfer"), value: "transfer" },
  { label: $t("dict.outboundType.internal"), value: "internal" },
  { label: $t("dict.outboundType.scrap"), value: "scrap" },
  { label: $t("dict.outboundType.other"), value: "other" }
];

/** 出库单状态 */
export const outboundStatusOptions: DictItem[] = [
  {
    label: $t("dict.outboundStatus.pending"),
    value: "pending",
    tag: "warning"
  },
  {
    label: $t("dict.outboundStatus.allocating"),
    value: "allocating",
    tag: "info"
  },
  {
    label: $t("dict.outboundStatus.picking_wait"),
    value: "picking_wait",
    tag: "info"
  },
  {
    label: $t("dict.outboundStatus.picking"),
    value: "picking",
    tag: "primary"
  },
  { label: $t("dict.outboundStatus.review"), value: "review", tag: "warning" },
  {
    label: $t("dict.outboundStatus.shipping_wait"),
    value: "shipping_wait",
    tag: "warning"
  },
  {
    label: $t("dict.outboundStatus.shipped"),
    value: "shipped",
    tag: "success"
  },
  {
    label: $t("dict.outboundStatus.finished"),
    value: "finished",
    tag: "success"
  },
  {
    label: $t("dict.outboundStatus.cancelled"),
    value: "cancelled",
    tag: "danger"
  },
  {
    label: $t("dict.outboundStatus.stockout"),
    value: "stockout",
    tag: "danger"
  }
];

/** 优先级 */
export const priorityOptions: DictItem[] = [
  { label: $t("dict.priority.urgent"), value: "urgent", tag: "danger" },
  { label: $t("dict.priority.high"), value: "high", tag: "warning" },
  { label: $t("dict.priority.normal"), value: "normal", tag: "info" },
  { label: $t("dict.priority.low"), value: "low", tag: "info" }
];

// ========================= 库存 =========================

/** 库存状态 */
export const stockStatusOptions: DictItem[] = [
  {
    label: $t("dict.stockStatus.qualified"),
    value: "qualified",
    tag: "success"
  },
  {
    label: $t("dict.stockStatus.inspecting"),
    value: "inspecting",
    tag: "warning"
  },
  { label: $t("dict.stockStatus.frozen"), value: "frozen", tag: "danger" },
  {
    label: $t("dict.stockStatus.unqualified"),
    value: "unqualified",
    tag: "danger"
  }
];

/** 移库类型 */
export const moveTypeOptions: DictItem[] = [
  { label: $t("dict.moveType.location"), value: "location" },
  { label: $t("dict.moveType.container"), value: "container" },
  { label: $t("dict.moveType.transfer"), value: "transfer" }
];

/** 批次效期状态 */
export const batchStatusOptions: DictItem[] = [
  { label: $t("dict.batchStatus.normal"), value: "normal", tag: "success" },
  { label: $t("dict.batchStatus.expiring"), value: "expiring", tag: "warning" },
  { label: $t("dict.batchStatus.expired"), value: "expired", tag: "danger" }
];

/** 库存调整类型 */
export const adjustTypeOptions: DictItem[] = [
  { label: $t("dict.adjustType.gain"), value: "gain", tag: "success" },
  { label: $t("dict.adjustType.loss"), value: "loss", tag: "danger" }
];

/** 库存调整单状态 */
export const adjustStatusOptions: DictItem[] = [
  { label: $t("dict.adjustStatus.pending"), value: "pending", tag: "warning" },
  {
    label: $t("dict.adjustStatus.approved"),
    value: "approved",
    tag: "success"
  },
  { label: $t("dict.adjustStatus.rejected"), value: "rejected", tag: "danger" }
];

/** 预警处理状态 */
export const warningStatusOptions: DictItem[] = [
  { label: $t("dict.warningStatus.active"), value: "active", tag: "danger" },
  { label: $t("dict.warningStatus.handled"), value: "handled", tag: "success" }
];

/** 盘点状态 */
export const stocktakeStatusOptions: DictItem[] = [
  { label: $t("dict.stocktakeStatus.draft"), value: "draft", tag: "info" },
  {
    label: $t("dict.stocktakeStatus.counting"),
    value: "counting",
    tag: "primary"
  },
  { label: $t("dict.stocktakeStatus.diff"), value: "diff", tag: "warning" },
  {
    label: $t("dict.stocktakeStatus.finished"),
    value: "finished",
    tag: "success"
  },
  {
    label: $t("dict.stocktakeStatus.cancelled"),
    value: "cancelled",
    tag: "danger"
  }
];

/** 盘点方式 */
export const stocktakeModeOptions: DictItem[] = [
  { label: $t("dict.stocktakeMode.full"), value: "full" },
  { label: $t("dict.stocktakeMode.cycle"), value: "cycle" },
  { label: $t("dict.stocktakeMode.spot"), value: "spot" },
  { label: $t("dict.stocktakeMode.moving"), value: "moving" }
];

/** 库存事务类型（流水） */
export const transactionTypeOptions: DictItem[] = [
  {
    label: $t("dict.transactionType.receive"),
    value: "receive",
    tag: "success"
  },
  {
    label: $t("dict.transactionType.putaway"),
    value: "putaway",
    tag: "success"
  },
  { label: $t("dict.transactionType.sales"), value: "sales", tag: "danger" },
  {
    label: $t("dict.transactionType.transfer_out"),
    value: "transfer_out",
    tag: "danger"
  },
  {
    label: $t("dict.transactionType.transfer_in"),
    value: "transfer_in",
    tag: "success"
  },
  { label: $t("dict.transactionType.move"), value: "move", tag: "primary" },
  {
    label: $t("dict.transactionType.replenish"),
    value: "replenish",
    tag: "primary"
  },
  {
    label: $t("dict.transactionType.stocktake"),
    value: "stocktake",
    tag: "warning"
  },
  { label: $t("dict.transactionType.gain"), value: "gain", tag: "success" },
  { label: $t("dict.transactionType.loss"), value: "loss", tag: "danger" },
  { label: $t("dict.transactionType.freeze"), value: "freeze", tag: "warning" },
  {
    label: $t("dict.transactionType.unfreeze"),
    value: "unfreeze",
    tag: "success"
  }
];

/** 预警类型 */
export const warningTypeOptions: DictItem[] = [
  { label: $t("dict.warningType.low"), value: "low", tag: "danger" },
  { label: $t("dict.warningType.over"), value: "over", tag: "warning" },
  { label: $t("dict.warningType.dead"), value: "dead", tag: "info" },
  { label: $t("dict.warningType.expiring"), value: "expiring", tag: "warning" },
  { label: $t("dict.warningType.expired"), value: "expired", tag: "danger" }
];

/** 序列号状态 */
export const serialStatusOptions: DictItem[] = [
  { label: $t("dict.serialStatus.instock"), value: "instock", tag: "success" },
  {
    label: $t("dict.serialStatus.allocated"),
    value: "allocated",
    tag: "warning"
  },
  { label: $t("dict.serialStatus.outbound"), value: "outbound", tag: "info" },
  { label: $t("dict.serialStatus.scrapped"), value: "scrapped", tag: "danger" },
  {
    label: $t("dict.serialStatus.repairing"),
    value: "repairing",
    tag: "warning"
  }
];

// ========================= 库内作业 =========================

/** 任务类型 */
export const taskTypeOptions: DictItem[] = [
  { label: $t("dict.taskType.receive"), value: "receive" },
  { label: $t("dict.taskType.qc"), value: "qc" },
  { label: $t("dict.taskType.putaway"), value: "putaway" },
  { label: $t("dict.taskType.replenish"), value: "replenish" },
  { label: $t("dict.taskType.picking"), value: "picking" },
  { label: $t("dict.taskType.review"), value: "review" },
  { label: $t("dict.taskType.move"), value: "move" },
  { label: $t("dict.taskType.stocktake"), value: "stocktake" }
];

/** 任务状态 */
export const taskStatusOptions: DictItem[] = [
  { label: $t("dict.taskStatus.pending"), value: "pending", tag: "info" },
  {
    label: $t("dict.taskStatus.processing"),
    value: "processing",
    tag: "primary"
  },
  { label: $t("dict.taskStatus.finished"), value: "finished", tag: "success" },
  { label: $t("dict.taskStatus.cancelled"), value: "cancelled", tag: "danger" },
  { label: $t("dict.taskStatus.error"), value: "error", tag: "danger" }
];

// ========================= 运输 =========================

/** 承运商类型 */
export const carrierTypeOptions: DictItem[] = [
  { label: $t("dict.carrierType.self"), value: "self" },
  { label: $t("dict.carrierType.third"), value: "third" }
];

/** 配送单状态 */
export const deliveryStatusOptions: DictItem[] = [
  { label: $t("dict.deliveryStatus.pending"), value: "pending", tag: "info" },
  {
    label: $t("dict.deliveryStatus.dispatched"),
    value: "dispatched",
    tag: "primary"
  },
  {
    label: $t("dict.deliveryStatus.delivering"),
    value: "delivering",
    tag: "warning"
  },
  { label: $t("dict.deliveryStatus.signed"), value: "signed", tag: "success" },
  { label: $t("dict.deliveryStatus.error"), value: "error", tag: "danger" }
];

// ========================= 计费 =========================

/** 费用类型 */
export const feeTypeOptions: DictItem[] = [
  { label: $t("dict.feeType.storage"), value: "storage" },
  { label: $t("dict.feeType.operation"), value: "operation" },
  { label: $t("dict.feeType.handling"), value: "handling" },
  { label: $t("dict.feeType.material"), value: "material" },
  { label: $t("dict.feeType.transport"), value: "transport" }
];

/** 账单状态 */
export const billStatusOptions: DictItem[] = [
  { label: $t("dict.billStatus.pending"), value: "pending", tag: "warning" },
  {
    label: $t("dict.billStatus.confirmed"),
    value: "confirmed",
    tag: "primary"
  },
  { label: $t("dict.billStatus.invoiced"), value: "invoiced", tag: "success" },
  { label: $t("dict.billStatus.settled"), value: "settled", tag: "success" },
  { label: $t("dict.billStatus.disputed"), value: "disputed", tag: "danger" }
];

// ========================= 设备集成 =========================

/** 设备类型 */
export const deviceTypeOptions: DictItem[] = [
  { label: $t("dict.deviceType.agv"), value: "agv" },
  { label: $t("dict.deviceType.stacker"), value: "stacker" },
  { label: $t("dict.deviceType.conveyor"), value: "conveyor" },
  { label: $t("dict.deviceType.ptl"), value: "ptl" },
  { label: $t("dict.deviceType.sorter"), value: "sorter" },
  { label: $t("dict.deviceType.door"), value: "door" }
];

/** 设备状态 */
export const deviceStatusOptions: DictItem[] = [
  { label: $t("dict.deviceStatus.online"), value: "online", tag: "success" },
  { label: $t("dict.deviceStatus.offline"), value: "offline", tag: "info" },
  { label: $t("dict.deviceStatus.error"), value: "error", tag: "danger" },
  {
    label: $t("dict.deviceStatus.repairing"),
    value: "repairing",
    tag: "warning"
  },
  {
    label: $t("dict.deviceStatus.charging"),
    value: "charging",
    tag: "warning"
  },
  { label: $t("dict.deviceStatus.working"), value: "working", tag: "primary" }
];

/** 设备任务状态 */
export const deviceTaskStatusOptions: DictItem[] = [
  { label: $t("dict.deviceTaskStatus.queued"), value: "queued", tag: "info" },
  {
    label: $t("dict.deviceTaskStatus.executing"),
    value: "executing",
    tag: "primary"
  },
  {
    label: $t("dict.deviceTaskStatus.finished"),
    value: "finished",
    tag: "success"
  },
  { label: $t("dict.deviceTaskStatus.failed"), value: "failed", tag: "danger" },
  {
    label: $t("dict.deviceTaskStatus.cancelled"),
    value: "cancelled",
    tag: "info"
  }
];

/** 集成系统类型 */
export const integrationTypeOptions: DictItem[] = [
  { label: $t("dict.integrationType.erp"), value: "erp" },
  { label: $t("dict.integrationType.oms"), value: "oms" },
  { label: $t("dict.integrationType.tms"), value: "tms" },
  { label: $t("dict.integrationType.wcs"), value: "wcs" },
  { label: $t("dict.integrationType.ecom"), value: "ecom" }
];

/** 接口方向 */
export const apiDirectionOptions: DictItem[] = [
  { label: $t("dict.apiDirection.down"), value: "down" },
  { label: $t("dict.apiDirection.up"), value: "up" }
];

/** 接口状态 */
export const apiLogStatusOptions: DictItem[] = [
  { label: $t("dict.apiLogStatus.success"), value: "success", tag: "success" },
  { label: $t("dict.apiLogStatus.fail"), value: "fail", tag: "danger" },
  { label: $t("dict.apiLogStatus.retry"), value: "retry", tag: "warning" }
];

// ========================= 海关对接 =========================

/** 账册类型 */
export const customsLedgerTypeOptions: DictItem[] = [
  {
    label: $t("dict.customsLedgerType.bonded_logistics"),
    value: "bonded_logistics"
  },
  {
    label: $t("dict.customsLedgerType.process_trade"),
    value: "process_trade"
  },
  {
    label: $t("dict.customsLedgerType.export_warehouse"),
    value: "export_warehouse"
  }
];

/** 账册状态 */
export const customsLedgerStatusOptions: DictItem[] = [
  {
    label: $t("dict.customsLedgerStatus.active"),
    value: "active",
    tag: "success"
  },
  {
    label: $t("dict.customsLedgerStatus.changing"),
    value: "changing",
    tag: "warning"
  },
  {
    label: $t("dict.customsLedgerStatus.expired"),
    value: "expired",
    tag: "danger"
  },
  {
    label: $t("dict.customsLedgerStatus.cancelled"),
    value: "cancelled",
    tag: "info"
  }
];

/** 监管方式 */
export const supervisionModeOptions: DictItem[] = [
  { label: $t("dict.supervisionMode.1210"), value: "1210" },
  { label: $t("dict.supervisionMode.1239"), value: "1239" },
  { label: $t("dict.supervisionMode.1233"), value: "1233" },
  { label: $t("dict.supervisionMode.0110"), value: "0110" },
  { label: $t("dict.supervisionMode.5034"), value: "5034" }
];

/** 核注清单类型 */
export const customsVerifyTypeOptions: DictItem[] = [
  { label: $t("dict.customsVerifyType.in"), value: "in", tag: "success" },
  { label: $t("dict.customsVerifyType.out"), value: "out", tag: "warning" }
];

/** 核注清单状态 */
export const customsVerifyStatusOptions: DictItem[] = [
  { label: $t("dict.customsVerifyStatus.draft"), value: "draft", tag: "info" },
  {
    label: $t("dict.customsVerifyStatus.declared"),
    value: "declared",
    tag: "warning"
  },
  {
    label: $t("dict.customsVerifyStatus.passed"),
    value: "passed",
    tag: "primary"
  },
  {
    label: $t("dict.customsVerifyStatus.deducted"),
    value: "deducted",
    tag: "success"
  },
  {
    label: $t("dict.customsVerifyStatus.refused"),
    value: "refused",
    tag: "danger"
  },
  {
    label: $t("dict.customsVerifyStatus.cancelled"),
    value: "cancelled",
    tag: "info"
  }
];

/** 核放单方向 */
export const releaseDirectionOptions: DictItem[] = [
  { label: $t("dict.releaseDirection.in"), value: "in", tag: "success" },
  { label: $t("dict.releaseDirection.out"), value: "out", tag: "warning" }
];

/** 核放单状态 */
export const releaseStatusOptions: DictItem[] = [
  { label: $t("dict.releaseStatus.draft"), value: "draft", tag: "info" },
  {
    label: $t("dict.releaseStatus.declared"),
    value: "declared",
    tag: "warning"
  },
  {
    label: $t("dict.releaseStatus.released"),
    value: "released",
    tag: "primary"
  },
  { label: $t("dict.releaseStatus.crossed"), value: "crossed", tag: "success" },
  {
    label: $t("dict.releaseStatus.cancelled"),
    value: "cancelled",
    tag: "danger"
  }
];

/** 三单类型 */
export const tripleDocTypeOptions: DictItem[] = [
  { label: $t("dict.tripleDocType.order"), value: "order", tag: "primary" },
  { label: $t("dict.tripleDocType.payment"), value: "payment", tag: "warning" },
  {
    label: $t("dict.tripleDocType.logistics"),
    value: "logistics",
    tag: "success"
  }
];

/** 三单对碰状态 */
export const tripleStatusOptions: DictItem[] = [
  { label: $t("dict.tripleStatus.pending"), value: "pending", tag: "info" },
  { label: $t("dict.tripleStatus.pushed"), value: "pushed", tag: "warning" },
  { label: $t("dict.tripleStatus.matched"), value: "matched", tag: "success" },
  { label: $t("dict.tripleStatus.failed"), value: "failed", tag: "danger" }
];

/** 跨境电商平台 */
export const triplePlatformOptions: DictItem[] = [
  { label: $t("dict.triplePlatform.tmall"), value: "tmall" },
  { label: $t("dict.triplePlatform.jd"), value: "jd" },
  { label: $t("dict.triplePlatform.pdd"), value: "pdd" },
  { label: $t("dict.triplePlatform.douyin"), value: "douyin" },
  { label: $t("dict.triplePlatform.kaola"), value: "kaola" }
];

/** 海关报文类型 */
export const customsMsgTypeOptions: DictItem[] = [
  { label: $t("dict.customsMsgType.verify"), value: "verify" },
  { label: $t("dict.customsMsgType.release"), value: "release" },
  { label: $t("dict.customsMsgType.triple"), value: "triple" },
  { label: $t("dict.customsMsgType.summary"), value: "summary" },
  { label: $t("dict.customsMsgType.ledger"), value: "ledger" }
];

/** 海关申报通道 */
export const customsChannelOptions: DictItem[] = [
  { label: $t("dict.customsChannel.single_window"), value: "single_window" },
  {
    label: $t("dict.customsChannel.golden_phase2"),
    value: "golden_phase2"
  },
  { label: $t("dict.customsChannel.ceb_platform"), value: "ceb_platform" }
];

/** 报文方向 */
export const customsMsgDirectionOptions: DictItem[] = [
  { label: $t("dict.customsMsgDirection.up"), value: "up" },
  { label: $t("dict.customsMsgDirection.down"), value: "down" }
];

/** 报文状态 */
export const customsMsgStatusOptions: DictItem[] = [
  {
    label: $t("dict.customsMsgStatus.success"),
    value: "success",
    tag: "success"
  },
  { label: $t("dict.customsMsgStatus.fail"), value: "fail", tag: "danger" },
  {
    label: $t("dict.customsMsgStatus.pending"),
    value: "pending",
    tag: "warning"
  },
  { label: $t("dict.customsMsgStatus.resend"), value: "resend", tag: "warning" }
];

// ========================= 智能体 =========================

/** 智能体工作流业务场景 */
export const aiSceneOptions: DictItem[] = [
  { label: $t("dict.aiScene.inventory"), value: "inventory" },
  { label: $t("dict.aiScene.operation"), value: "operation" },
  { label: $t("dict.aiScene.transport"), value: "transport" },
  { label: $t("dict.aiScene.billing"), value: "billing" },
  { label: $t("dict.aiScene.customs"), value: "customs" },
  { label: $t("dict.aiScene.report"), value: "report" }
];

/** 智能体工作流触发方式 */
export const aiTriggerOptions: DictItem[] = [
  { label: $t("dict.aiTrigger.manual"), value: "manual", tag: "info" },
  { label: $t("dict.aiTrigger.scheduled"), value: "scheduled", tag: "warning" },
  { label: $t("dict.aiTrigger.event"), value: "event", tag: "success" }
];

/** 智能体运行状态 */
export const aiRunStatusOptions: DictItem[] = [
  { label: $t("dict.aiRunStatus.running"), value: "running", tag: "warning" },
  { label: $t("dict.aiRunStatus.success"), value: "success", tag: "success" },
  { label: $t("dict.aiRunStatus.failed"), value: "failed", tag: "danger" }
];

/** 智能体工作流节点类型 */
export const aiNodeTypeOptions: DictItem[] = [
  { label: $t("dict.aiNodeType.start"), value: "start", tag: "info" },
  { label: $t("dict.aiNodeType.llm"), value: "llm", tag: "success" },
  { label: $t("dict.aiNodeType.tool"), value: "tool", tag: "warning" },
  { label: $t("dict.aiNodeType.condition"), value: "condition", tag: "danger" },
  { label: $t("dict.aiNodeType.end"), value: "end", tag: "info" }
];

/** 智能体可用模型（型号名不翻译） */
export const aiModelOptions: DictItem[] = [
  { label: "GLM-4.7", value: "glm-4.7" },
  { label: "GLM-4.5-Air", value: "glm-4.5-air" },
  { label: "DeepSeek-V3.2", value: "deepseek-v3.2" },
  { label: "Qwen3-Max", value: "qwen3-max" }
];

/** 智能体工作流启停状态 */
export const aiWorkflowStatusOptions: DictItem[] = [
  {
    label: $t("dict.aiWorkflowStatus.enabled"),
    value: "enabled",
    tag: "success"
  },
  {
    label: $t("dict.aiWorkflowStatus.disabled"),
    value: "disabled",
    tag: "info"
  }
];
