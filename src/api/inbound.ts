/**
 * 入库管理模块 API（预约/收货/质检/上架/退货）
 */
import { http } from "@/utils/http";
import type { ApiResult, PageQuery, PageResult } from "./types";

// ========================= 类型定义 =========================

/** 入库预约单 */
export interface AsnItem {
  id: number;
  code: string;
  warehouseCode: string;
  ownerName: string;
  supplierName: string;
  type: string; // purchase/return/transfer/gain/other
  expectedArrival: string;
  status: string; // draft/pending/approved/finished/cancelled
  remark?: string;
  createdAt?: string;
}

/** 收货单 */
export interface ReceiptItem {
  id: number;
  code: string;
  asnCode?: string;
  warehouseCode: string;
  supplierName: string;
  materialCode: string;
  materialName: string;
  batchNo?: string;
  receivedQty: number;
  qualifiedQty: number;
  rejectedQty: number;
  status: string; // pending/waiting/receiving/qc/putaway/finished/cancelled
  receiver?: string;
  createdAt?: string;
}

/** 质检单 */
export interface QcItem {
  id: number;
  code: string;
  receiptCode: string;
  materialCode: string;
  materialName: string;
  batchNo?: string;
  qcQty: number;
  qcResult: string; // waiting/pass/fail/concession
  qcUser?: string;
  qcRemark?: string;
  createdAt?: string;
}

/** 上架任务 */
export interface PutawayTaskItem {
  id: number;
  taskNo: string;
  receiptCode: string;
  warehouseCode: string;
  fromLocation: string;
  toLocation: string;
  materialCode: string;
  materialName: string;
  qty: number;
  status: string; // pending/processing/finished/cancelled
  operator?: string;
  createdAt?: string;
}

/** 退货入库单 */
export interface ReturnInboundItem {
  id: number;
  code: string;
  warehouseCode: string;
  ownerName: string;
  customerName: string;
  materialCode: string;
  materialName: string;
  qty: number;
  reason?: string;
  remark?: string;
  status: string; // pending/approved/receiving/finished/cancelled
  createdAt?: string;
}

// ========================= 入库预约 =========================

export const getAsnPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<AsnItem>>>("get", "/wms/inbound/asn/page", {
    params
  });

export const addAsn = (data: Partial<AsnItem>) =>
  http.request<ApiResult<AsnItem>>("post", "/wms/inbound/asn/add", { data });

export const updateAsn = (data: Partial<AsnItem>) =>
  http.request<ApiResult<AsnItem>>("post", "/wms/inbound/asn/update", { data });

export const deleteAsn = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/inbound/asn/delete", {
    data: { ids }
  });

export const approveAsn = (id: number, pass: boolean) =>
  http.request<ApiResult<boolean>>("post", "/wms/inbound/asn/approve", {
    data: { id, pass }
  });

// ========================= 收货管理 =========================

export const getReceiptPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<ReceiptItem>>>(
    "get",
    "/wms/inbound/receipt/page",
    { params }
  );

export const auditReceipt = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/inbound/receipt/audit", {
    data: { id }
  });

export const registerReceipt = (data: {
  id: number;
  receivedQty: number;
  qualifiedQty: number;
  rejectedQty: number;
}) =>
  http.request<ApiResult<boolean>>("post", "/wms/inbound/receipt/register", {
    data
  });

// ========================= 质检管理 =========================

export const getQcPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<QcItem>>>("get", "/wms/inbound/qc/page", {
    params
  });

export const submitQc = (data: {
  id: number;
  qcResult: string;
  qcRemark?: string;
}) =>
  http.request<ApiResult<boolean>>("post", "/wms/inbound/qc/submit", { data });

// ========================= 上架任务 =========================

export const getPutawayPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<PutawayTaskItem>>>(
    "get",
    "/wms/inbound/putaway/page",
    { params }
  );

export const finishPutaway = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/inbound/putaway/finish", {
    data: { id }
  });

// ========================= 退货入库 =========================

export const getReturnPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<ReturnInboundItem>>>(
    "get",
    "/wms/inbound/return/page",
    { params }
  );

export const addReturn = (data: Partial<ReturnInboundItem>) =>
  http.request<ApiResult<ReturnInboundItem>>(
    "post",
    "/wms/inbound/return/add",
    { data }
  );

export const updateReturn = (data: Partial<ReturnInboundItem>) =>
  http.request<ApiResult<ReturnInboundItem>>(
    "post",
    "/wms/inbound/return/update",
    { data }
  );

export const deleteReturn = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/inbound/return/delete", {
    data: { ids }
  });

export const approveReturn = (id: number, pass: boolean) =>
  http.request<ApiResult<boolean>>("post", "/wms/inbound/return/approve", {
    data: { id, pass }
  });
