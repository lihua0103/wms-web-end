/**
 * 出库管理模块 API（出库单/波次/拣货/复核/发货）
 */
import { http } from "@/utils/http";
import type { ApiResult, PageQuery, PageResult } from "./types";

// ========================= 类型定义 =========================

/** 出库单 */
export interface OutboundOrderItem {
  id: number;
  code: string;
  warehouseCode: string;
  ownerName: string;
  customerName: string;
  type: string; // sales/transfer/internal/scrap/other
  priority: string; // urgent/high/normal/low
  materialCode: string;
  materialName: string;
  qty: number;
  status: string;
  deliveryDate?: string;
  remark?: string;
  createdAt?: string;
}

/** 波次 */
export interface WaveItem {
  id: number;
  code: string;
  warehouseCode: string;
  orderCount: number;
  qty: number;
  carrierName?: string;
  status: string; // pending/processing/finished/cancelled
  createdAt?: string;
}

/** 拣货任务 */
export interface PickingTaskItem {
  id: number;
  taskNo: string;
  waveCode?: string;
  orderCode: string;
  warehouseCode: string;
  locationCode: string;
  materialCode: string;
  materialName: string;
  pickQty: number;
  status: string; // pending/processing/finished/cancelled
  picker?: string;
  createdAt?: string;
}

/** 复核打包 */
export interface PackingItem {
  id: number;
  code: string;
  orderCode: string;
  waveCode?: string;
  materialCode: string;
  materialName: string;
  qty: number;
  checkedQty: number;
  weight?: number;
  boxNo?: string;
  status: string; // waiting/processing/finished
  operator?: string;
  createdAt?: string;
}

/** 发货交接 */
export interface ShippingItem {
  id: number;
  code: string;
  orderCode: string;
  carrierName?: string;
  vehicleNo?: string;
  driverName?: string;
  qty: number;
  status: string; // waiting/shipped/finished
  shipDate?: string;
  createdAt?: string;
}

// ========================= 出库单 =========================

export const getOutboundPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<OutboundOrderItem>>>(
    "get",
    "/wms/outbound/order/page",
    { params }
  );

export const getOutboundDetail = (id: number) =>
  http.request<ApiResult<OutboundOrderItem>>(
    "get",
    "/wms/outbound/order/detail",
    { params: { id } }
  );

export const addOutbound = (data: Partial<OutboundOrderItem>) =>
  http.request<ApiResult<OutboundOrderItem>>(
    "post",
    "/wms/outbound/order/add",
    { data }
  );

export const updateOutbound = (data: Partial<OutboundOrderItem>) =>
  http.request<ApiResult<OutboundOrderItem>>(
    "post",
    "/wms/outbound/order/update",
    { data }
  );

export const deleteOutbound = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/outbound/order/delete", {
    data: { ids }
  });

export const approveOutbound = (id: number, pass: boolean) =>
  http.request<ApiResult<boolean>>("post", "/wms/outbound/order/approve", {
    data: { id, pass }
  });

// ========================= 波次 =========================

export const getWavePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<WaveItem>>>(
    "get",
    "/wms/outbound/wave/page",
    { params }
  );

export const generateWave = (data: {
  warehouseCode: string;
  carrierName?: string;
}) =>
  http.request<ApiResult<WaveItem>>("post", "/wms/outbound/wave/generate", {
    data
  });

export const releaseWave = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/outbound/wave/release", {
    data: { id }
  });

// ========================= 拣货 =========================

export const getPickingPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<PickingTaskItem>>>(
    "get",
    "/wms/outbound/picking/page",
    { params }
  );

export const startPicking = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/outbound/picking/start", {
    data: { id }
  });

export const finishPicking = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/outbound/picking/finish", {
    data: { id }
  });

// ========================= 复核打包 =========================

export const getPackingPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<PackingItem>>>(
    "get",
    "/wms/outbound/packing/page",
    { params }
  );

export const checkPacking = (data: {
  id: number;
  checkedQty: number;
  weight?: number;
}) =>
  http.request<ApiResult<boolean>>("post", "/wms/outbound/packing/check", {
    data
  });

// ========================= 发货交接 =========================

export const getShippingPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<ShippingItem>>>(
    "get",
    "/wms/outbound/shipping/page",
    { params }
  );

export const confirmShipping = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/outbound/shipping/confirm", {
    data: { id }
  });
