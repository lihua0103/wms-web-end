/**
 * 库存管理模块 API（核心模块，含序列号管理）
 */
import { http } from "@/utils/http";
import type { ApiResult, PageQuery, PageResult } from "./types";

// ========================= 类型定义 =========================

/** 库存台账 */
export interface LedgerItem {
  id: number;
  warehouseCode: string;
  warehouseName?: string;
  locationCode: string;
  materialCode: string;
  materialName: string;
  batchNo?: string;
  stockStatus: string; // qualified/inspecting/frozen/unqualified
  qty: number;
  lockedQty: number;
  availableQty: number;
  ownerName: string;
  expiredAt?: string;
  createdAt?: string;
}

/** 序列号 */
export interface SerialItem {
  id: number;
  serialNo: string;
  materialCode: string;
  materialName: string;
  batchNo?: string;
  status: string; // instock/allocated/outbound/scrapped/repairing
  warehouseCode: string;
  locationCode?: string;
  inboundDate?: string;
  outboundDate?: string;
  orderNo?: string;
  remark?: string;
}

/** 批次效期 */
export interface BatchItem {
  id: number;
  materialCode: string;
  materialName: string;
  batchNo: string;
  warehouseCode: string;
  qty: number;
  productionDate: string;
  expiredAt: string;
  remainDays: number;
  status: string; // normal/expiring/expired
}

/** 移库单 */
export interface MoveItem {
  id: number;
  code: string;
  moveType: string; // location/container/transfer
  warehouseCode: string;
  materialCode: string;
  materialName: string;
  batchNo?: string;
  fromLocation: string;
  toLocation: string;
  qty: number;
  status: string; // pending/processing/finished/cancelled
  operator?: string;
  createdAt?: string;
}

/** 库存调整单 */
export interface AdjustmentItem {
  id: number;
  code: string;
  warehouseCode: string;
  materialCode: string;
  materialName: string;
  batchNo?: string;
  locationCode: string;
  adjustType: string; // gain报溢/loss报损
  qtyBefore: number;
  qtyChange: number;
  qtyAfter: number;
  reason?: string;
  status: string; // pending/approved/rejected
  applicant?: string;
  createdAt?: string;
}

/** 盘点单 */
export interface StocktakeItem {
  id: number;
  code: string;
  warehouseCode: string;
  mode: string; // full/cycle/spot/moving
  status: string; // draft/counting/diff/finished/cancelled
  planDate: string;
  totalCount: number;
  diffCount: number;
  remark?: string;
  creator?: string;
  createdAt?: string;
}

/** 盘点明细 */
export interface StocktakeDetailItem {
  id: number;
  stocktakeId: number;
  locationCode: string;
  materialCode: string;
  materialName: string;
  batchNo?: string;
  bookQty: number;
  actualQty: number | null;
  diffQty: number;
  countedBy?: string;
}

/** 库存预警 */
export interface WarningItem {
  id: number;
  warningType: string; // low/over/dead/expiring/expired
  materialCode: string;
  materialName: string;
  warehouseCode: string;
  locationCode?: string;
  batchNo?: string;
  qty: number;
  safetyQty?: number;
  expiredAt?: string;
  days?: number;
  status: string; // active/handled
  createdAt?: string;
}

/** 库存流水 */
export interface TransactionItem {
  id: number;
  transactionNo: string;
  transactionType: string;
  warehouseCode: string;
  locationCode: string;
  materialCode: string;
  materialName: string;
  batchNo?: string;
  qtyChange: number;
  balanceQty: number;
  bizNo?: string;
  operator: string;
  createdAt: string;
}

// ========================= 库存台账 =========================

export const getLedgerPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<LedgerItem>>>(
    "get",
    "/wms/inventory/ledger/page",
    { params }
  );

/** 冻结/解冻 */
export const freezeStock = (ids: number[], freeze: boolean) =>
  http.request<ApiResult<boolean>>("post", "/wms/inventory/ledger/freeze", {
    data: { ids, freeze }
  });

// ========================= 序列号管理 =========================

export const getSerialPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<SerialItem>>>(
    "get",
    "/wms/inventory/serial/page",
    { params }
  );

export const addSerial = (data: Partial<SerialItem>) =>
  http.request<ApiResult<SerialItem>>("post", "/wms/inventory/serial/add", {
    data
  });

export const updateSerial = (data: Partial<SerialItem>) =>
  http.request<ApiResult<SerialItem>>("post", "/wms/inventory/serial/update", {
    data
  });

export const deleteSerial = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/inventory/serial/delete", {
    data: { ids }
  });

/** 序列号报废 */
export const scrapSerial = (ids: number[], reason?: string) =>
  http.request<ApiResult<boolean>>("post", "/wms/inventory/serial/scrap", {
    data: { ids, reason }
  });

// ========================= 批次效期 =========================

export const getBatchPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<BatchItem>>>(
    "get",
    "/wms/inventory/batch/page",
    { params }
  );

// ========================= 移库管理 =========================

export const getMovePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<MoveItem>>>(
    "get",
    "/wms/inventory/move/page",
    { params }
  );

export const addMove = (data: Partial<MoveItem>) =>
  http.request<ApiResult<MoveItem>>("post", "/wms/inventory/move/add", {
    data
  });

export const executeMove = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/inventory/move/execute", {
    data: { id }
  });

export const cancelMove = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/inventory/move/cancel", {
    data: { id }
  });

// ========================= 库存调整 =========================

export const getAdjustmentPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<AdjustmentItem>>>(
    "get",
    "/wms/inventory/adjustment/page",
    { params }
  );

export const addAdjustment = (data: Partial<AdjustmentItem>) =>
  http.request<ApiResult<AdjustmentItem>>(
    "post",
    "/wms/inventory/adjustment/add",
    { data }
  );

export const approveAdjustment = (id: number, pass: boolean) =>
  http.request<ApiResult<boolean>>(
    "post",
    "/wms/inventory/adjustment/approve",
    { data: { id, pass } }
  );

// ========================= 盘点管理 =========================

export const getStocktakePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<StocktakeItem>>>(
    "get",
    "/wms/inventory/stocktake/page",
    { params }
  );

export const addStocktake = (data: Partial<StocktakeItem>) =>
  http.request<ApiResult<StocktakeItem>>(
    "post",
    "/wms/inventory/stocktake/add",
    { data }
  );

export const startStocktake = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/inventory/stocktake/start", {
    data: { id }
  });

/** 提交盘点差异（盘点中 → 待处理差异） */
export const submitStocktakeDiff = (id: number) =>
  http.request<ApiResult<boolean>>(
    "post",
    "/wms/inventory/stocktake/submit-diff",
    { data: { id } }
  );

/** 处理差异完成（生成调整单，→ 已完成） */
export const finishStocktake = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/inventory/stocktake/finish", {
    data: { id }
  });

export const cancelStocktake = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/inventory/stocktake/cancel", {
    data: { id }
  });

export const getStocktakeDetailPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<StocktakeDetailItem>>>(
    "get",
    "/wms/inventory/stocktake/detail-items",
    { params }
  );

/** 录入盘点实际数量 */
export const saveStocktakeActual = (detailId: number, actualQty: number) =>
  http.request<ApiResult<boolean>>(
    "post",
    "/wms/inventory/stocktake/save-actual",
    { data: { detailId, actualQty } }
  );

// ========================= 库存预警 =========================

export const getWarningPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<WarningItem>>>(
    "get",
    "/wms/inventory/warning/page",
    { params }
  );

/** 标记处理 */
export const handleWarning = (id: number, remark?: string) =>
  http.request<ApiResult<boolean>>("post", "/wms/inventory/warning/handle", {
    data: { id, remark }
  });

// ========================= 库存流水 =========================

export const getTransactionPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<TransactionItem>>>(
    "get",
    "/wms/inventory/transaction/page",
    { params }
  );
