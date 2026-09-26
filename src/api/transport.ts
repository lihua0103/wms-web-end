/**
 * 运输管理模块 API（承运商/车辆司机/配送单/在途跟踪）
 */
import { http } from "@/utils/http";
import type { ApiResult, PageQuery, PageResult } from "./types";

// ========================= 类型定义 =========================

/** 承运商 */
export interface CarrierItem {
  id: number;
  code: string;
  name: string;
  carrierType: string; // self/third
  contact?: string;
  phone?: string;
  serviceArea?: string;
  settleType?: string; // 月结/现结
  status: number;
  remark?: string;
  createdAt?: string;
}

/** 车辆司机 */
export interface VehicleItem {
  id: number;
  vehicleNo: string;
  driverName: string;
  phone?: string;
  vehicleType: string; // 厢式/平板/冷藏
  maxLoad?: number;
  carrierName?: string;
  status: string; // 空闲/在途/维修
  remark?: string;
  createdAt?: string;
}

/** 配送单 */
export interface DispatchItem {
  id: number;
  code: string;
  orderCode: string;
  customerName: string;
  address?: string;
  carrierName?: string;
  vehicleNo?: string;
  driverName?: string;
  qty: number;
  status: string; // pending/dispatched/delivering/signed/error
  createdAt?: string;
}

/** 在途跟踪 */
export interface TrackingItem {
  id: number;
  code: string;
  carrierName: string;
  vehicleNo: string;
  driverName: string;
  fromCity: string;
  toCity: string;
  currentLocation: string;
  progress: number; // 0-100
  status: string;
  updatedAt?: string;
}

// ========================= 承运商 =========================

export const getCarrierPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<CarrierItem>>>("get", "/wms/transport/carrier/page", { params });

export const addCarrier = (data: Partial<CarrierItem>) =>
  http.request<ApiResult<CarrierItem>>("post", "/wms/transport/carrier/add", { data });

export const updateCarrier = (data: Partial<CarrierItem>) =>
  http.request<ApiResult<CarrierItem>>("post", "/wms/transport/carrier/update", { data });

export const deleteCarrier = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/transport/carrier/delete", { data: { ids } });

// ========================= 车辆司机 =========================

export const getVehiclePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<VehicleItem>>>("get", "/wms/transport/vehicle/page", { params });

export const addVehicle = (data: Partial<VehicleItem>) =>
  http.request<ApiResult<VehicleItem>>("post", "/wms/transport/vehicle/add", { data });

export const updateVehicle = (data: Partial<VehicleItem>) =>
  http.request<ApiResult<VehicleItem>>("post", "/wms/transport/vehicle/update", { data });

export const deleteVehicle = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/transport/vehicle/delete", { data: { ids } });

// ========================= 配送单 =========================

export const getDispatchPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<DispatchItem>>>("get", "/wms/transport/dispatch/page", { params });

/** 调度 */
export const assignDispatch = (data: {
  id: number;
  carrierName: string;
  vehicleNo: string;
  driverName: string;
}) => http.request<ApiResult<boolean>>("post", "/wms/transport/dispatch/assign", { data });

/** 签收 */
export const signDispatch = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/transport/dispatch/sign", { data: { id } });

// ========================= 在途跟踪 =========================

export const getTrackingPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<TrackingItem>>>("get", "/wms/transport/tracking/page", { params });
