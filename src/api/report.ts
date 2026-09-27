/**
 * 报表分析模块 API（库存看板 / 出入库报表 / 作业效率 / 数据大屏）
 */
import { http } from "@/utils/http";
import type { ApiResult } from "./types";

// ========================= 类型定义 =========================

/** 名称-数值对（图表通用） */
export interface NameValueItem {
  name: string;
  value: number;
}

/** 库存汇总统计卡 */
export interface StockSummary {
  totalQty: number;
  totalValue: number;
  skuCount: number;
  warningCount: number;
}

/** 库存看板 */
export interface DashboardData {
  stockSummary: StockSummary;
  categoryStock: NameValueItem[];
  warehouseStock: NameValueItem[];
  /** 库龄分布：0-30天/31-60/61-90/90+ */
  stockAge: NameValueItem[];
  turnoverTop: { name: string; turnover: number }[];
}

/** 出入库日汇总行 */
export interface InoutRow {
  date: string;
  inboundQty: number;
  outboundQty: number;
  inboundAmount: number;
  outboundAmount: number;
}

/** 出入库合计 */
export interface InoutTotal {
  inboundQty: number;
  outboundQty: number;
  inboundAmount: number;
  outboundAmount: number;
}

/** 出入库报表 */
export interface InoutReport {
  list: InoutRow[];
  total: InoutTotal;
}

/** 人员效率 */
export interface PersonEfficiency {
  name: string;
  taskCount: number;
  avgMinutes: number;
  errorRate: number;
}

/** 任务类型分布 */
export interface TypeCountItem {
  type: string;
  count: number;
}

/** 作业效率报表 */
export interface EfficiencyReport {
  personList: PersonEfficiency[];
  typeList: TypeCountItem[];
}

/** 实时告警 */
export interface AlarmItem {
  time: string;
  text: string;
  /** high/medium/low */
  level: string;
}

/** 数据大屏 */
export interface ScreenData {
  todayInbound: number;
  todayOutbound: number;
  onlineDevices: number;
  taskPending: number;
  hourlyFlow: { hour: string; inbound: number; outbound: number }[];
  zoneFill: { name: string; percent: number }[];
  alarmList: AlarmItem[];
}

// ========================= 接口 =========================

/** 库存看板统计 */
export const getDashboardData = () =>
  http.request<ApiResult<DashboardData>>("get", "/wms/report/dashboard");

/** 出入库报表（近 30 天，支持日期范围与仓库筛选） */
export const getInoutReport = (params?: {
  startDate?: string;
  endDate?: string;
  warehouseCode?: string;
}) =>
  http.request<ApiResult<InoutReport>>("get", "/wms/report/inout", { params });

/** 作业效率报表 */
export const getEfficiencyReport = () =>
  http.request<ApiResult<EfficiencyReport>>("get", "/wms/report/efficiency");

/** 数据大屏实时统计 */
export const getScreenData = () =>
  http.request<ApiResult<ScreenData>>("get", "/wms/report/screen");
