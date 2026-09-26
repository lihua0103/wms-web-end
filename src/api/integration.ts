/**
 * 设备与集成模块 API（设备管理 / AGV 调度 / 设备任务 / 集成配置 / 接口日志）
 */
import { http } from "@/utils/http";
import type { ApiResult, PageQuery, PageResult } from "./types";

// ========================= 类型定义 =========================

/** 自动化设备 */
export interface DeviceItem {
  id: number;
  /** 设备编码，如 AGV-001 */
  code: string;
  /** 设备名称 */
  name: string;
  /** 设备类型 agv/stacker/conveyor/ptl/sorter/door */
  deviceType: string;
  /** 所属仓库 */
  warehouseCode: string;
  /** 所在库区 A/B/C/D */
  zoneCode?: string;
  /** 状态 online/offline/error/repairing/charging/working */
  status: string;
  /** 最后心跳时间 */
  lastHeartbeat?: string;
  /** 设备 IP 地址 */
  ip: string;
  /** 设备厂商 */
  vendor: string;
}

/** AGV 调度任务 */
export interface AgvTaskItem {
  id: number;
  /** 任务号，前缀 AGV */
  taskNo: string;
  /** AGV 编号 */
  agvCode: string;
  /** 任务类型：搬运/入库/出库/充电 */
  taskType: string;
  /** 起始库位 */
  fromLocation: string;
  /** 目标库位 */
  toLocation: string;
  /** queued/executing/finished/failed/cancelled */
  status: string;
  /** 优先级 1-5，5 最高 */
  priority: number;
  createdAt?: string;
}

/** 设备任务（堆垛机/输送线/电子标签/分拣机等下发作业） */
export interface DeviceTaskItem {
  id: number;
  /** 任务号，前缀 WT */
  taskNo: string;
  /** 设备编码 */
  deviceCode: string;
  /** 设备类型 agv/stacker/conveyor/ptl/sorter */
  deviceType: string;
  /** 关联业务单号 */
  bizNo: string;
  /** 作业数量 */
  qty: number;
  /** queued/executing/finished/failed/cancelled */
  status: string;
  createdAt?: string;
  finishedAt?: string;
}

/** 集成系统配置 */
export interface IntegrationConfigItem {
  id: number;
  /** 对接系统名称 */
  systemName: string;
  /** erp/oms/tms/wcs/ecom */
  systemType: string;
  /** 接口地址 */
  apiUrl: string;
  /** 认证方式 token/signature */
  authType: string;
  /** enabled/disabled */
  status: string;
  /** 最近同步时间 */
  lastSyncTime?: string;
  /** 同步方向 down/up */
  syncDirection: string;
}

/** 接口调用日志 */
export interface ApiLogItem {
  id: number;
  /** 请求跟踪 ID */
  requestId: string;
  /** 对接系统名称 */
  systemName: string;
  /** 接口路径 */
  apiPath: string;
  /** 方向 down/up */
  direction: string;
  /** 耗时（毫秒） */
  duration: number;
  /** success/fail/retry */
  status: string;
  /** 失败原因 */
  errorMsg?: string;
  /** 请求摘要 */
  requestSummary?: string;
  /** 响应摘要 */
  responseSummary?: string;
  createdAt?: string;
}

// ========================= 设备管理 =========================

export const getDevicePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<DeviceItem>>>(
    "get",
    "/wms/integration/device/page",
    { params }
  );

export const addDevice = (data: Partial<DeviceItem>) =>
  http.request<ApiResult<DeviceItem>>("post", "/wms/integration/device/add", {
    data
  });

export const updateDevice = (data: Partial<DeviceItem>) =>
  http.request<ApiResult<DeviceItem>>(
    "post",
    "/wms/integration/device/update",
    { data }
  );

export const deleteDevice = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/integration/device/delete", {
    data: { ids }
  });

/** 设备启停（enable=true 上线 / false 离线） */
export const toggleDevice = (id: number, enable: boolean) =>
  http.request<ApiResult<boolean>>("post", "/wms/integration/device/toggle", {
    data: { id, enable }
  });

// ========================= AGV 调度 =========================

export const getAgvTaskPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<AgvTaskItem>>>(
    "get",
    "/wms/integration/agv/page",
    { params }
  );

/** 下发 AGV 任务（即新增） */
export const dispatchAgvTask = (data: Partial<AgvTaskItem>) =>
  http.request<ApiResult<AgvTaskItem>>(
    "post",
    "/wms/integration/agv/dispatch",
    { data }
  );

/** 失败任务重新下发（failed → queued） */
export const retryAgvTask = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/integration/agv/retry", {
    data: { id }
  });

// ========================= 设备任务 =========================

export const getDeviceTaskPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<DeviceTaskItem>>>(
    "get",
    "/wms/integration/devicetask/page",
    { params }
  );

/** 取消设备任务（状态 → cancelled） */
export const cancelDeviceTask = (id: number) =>
  http.request<ApiResult<boolean>>(
    "post",
    "/wms/integration/devicetask/cancel",
    { data: { id } }
  );

// ========================= 集成配置 =========================

export const getIntegrationConfigPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<IntegrationConfigItem>>>(
    "get",
    "/wms/integration/config/page",
    { params }
  );

export const addIntegrationConfig = (data: Partial<IntegrationConfigItem>) =>
  http.request<ApiResult<IntegrationConfigItem>>(
    "post",
    "/wms/integration/config/add",
    { data }
  );

export const updateIntegrationConfig = (data: Partial<IntegrationConfigItem>) =>
  http.request<ApiResult<IntegrationConfigItem>>(
    "post",
    "/wms/integration/config/update",
    { data }
  );

export const deleteIntegrationConfig = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/integration/config/delete", {
    data: { ids }
  });

/** 连接测试 */
export const testIntegrationConfig = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/integration/config/test", {
    data: { id }
  });

// ========================= 接口日志 =========================

export const getApiLogPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<ApiLogItem>>>(
    "get",
    "/wms/integration/apilog/page",
    { params }
  );
