/**
 * 库内作业模块 API（任务池/补货/加工/越库）
 */
import { http } from "@/utils/http";
import type { ApiResult, PageQuery, PageResult } from "./types";

// ========================= 类型定义 =========================

/** 作业任务 */
export interface TaskItem {
  id: number;
  taskNo: string;
  taskType: string; // receive/qc/putaway/replenish/picking/review/move/stocktake
  bizNo?: string;
  warehouseCode: string;
  locationCode?: string;
  materialCode: string;
  materialName: string;
  qty: number;
  status: string; // pending/processing/finished/cancelled/error
  assignee?: string;
  createdAt?: string;
}

/** 补货单 */
export interface ReplenishItem {
  id: number;
  code: string;
  warehouseCode: string;
  fromLocation: string;
  toLocation: string;
  materialCode: string;
  materialName: string;
  qty: number;
  trigger: string; // auto/manual
  status: string; // pending/processing/finished/cancelled
  createdAt?: string;
}

/** 加工单 */
export interface ProcessOrderItem {
  id: number;
  code: string;
  processType: string; // 贴标/组套/分装
  warehouseCode: string;
  materialCode: string;
  materialName: string;
  inputQty: number;
  outputQty: number;
  remark?: string;
  status: string; // pending/processing/finished/cancelled
  createdAt?: string;
}

/** 越库单 */
export interface CrossdockItem {
  id: number;
  code: string;
  asnCode: string;
  outboundCode: string;
  warehouseCode: string;
  materialCode: string;
  materialName: string;
  qty: number;
  status: string; // pending/processing/finished/cancelled
  createdAt?: string;
}

// ========================= 任务池 =========================

export const getTaskPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<TaskItem>>>(
    "get",
    "/wms/operation/task/page",
    { params }
  );

/** 分配任务 */
export const assignTask = (id: number, assignee: string) =>
  http.request<ApiResult<boolean>>("post", "/wms/operation/task/assign", {
    data: { id, assignee }
  });

/** 取消任务 */
export const cancelTask = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/operation/task/cancel", {
    data: { id }
  });

// ========================= 补货管理 =========================

export const getReplenishPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<ReplenishItem>>>(
    "get",
    "/wms/operation/replenish/page",
    { params }
  );

export const addReplenish = (data: Partial<ReplenishItem>) =>
  http.request<ApiResult<ReplenishItem>>(
    "post",
    "/wms/operation/replenish/add",
    { data }
  );

export const finishReplenish = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/operation/replenish/finish", {
    data: { id }
  });

// ========================= 加工管理 =========================

export const getProcessPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<ProcessOrderItem>>>(
    "get",
    "/wms/operation/process/page",
    { params }
  );

export const addProcess = (data: Partial<ProcessOrderItem>) =>
  http.request<ApiResult<ProcessOrderItem>>(
    "post",
    "/wms/operation/process/add",
    { data }
  );

export const updateProcess = (data: Partial<ProcessOrderItem>) =>
  http.request<ApiResult<ProcessOrderItem>>(
    "post",
    "/wms/operation/process/update",
    { data }
  );

export const deleteProcess = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/operation/process/delete", {
    data: { ids }
  });

export const startProcess = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/operation/process/start", {
    data: { id }
  });

export const finishProcess = (id: number, outputQty: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/operation/process/finish", {
    data: { id, outputQty }
  });

// ========================= 越库作业 =========================

export const getCrossdockPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<CrossdockItem>>>(
    "get",
    "/wms/operation/crossdock/page",
    { params }
  );

export const executeCrossdock = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/operation/crossdock/execute", {
    data: { id }
  });
