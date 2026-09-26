/**
 * 主数据模块 API（仓库/库区/库位/物料/货主/供应商/客户/容器）
 */
import { http } from "@/utils/http";
import type { ApiResult, PageQuery, PageResult } from "./types";

// ========================= 类型定义 =========================

export interface WarehouseItem {
  id: number;
  code: string;
  name: string;
  address?: string;
  contact?: string;
  phone?: string;
  type: string; // normal/cold/dangerous
  area?: number;
  areaUsed?: number;
  status: number;
  remark?: string;
}

export interface ZoneItem {
  id: number;
  warehouseCode: string;
  code: string;
  name: string;
  zoneType: string;
  locationCount?: number;
  status: number;
  remark?: string;
}

export interface LocationItem {
  id: number;
  warehouseCode: string;
  zoneCode: string;
  code: string;
  locationType: string;
  row?: number;
  col?: number;
  floor?: number;
  maxWeight?: number;
  maxVolume?: number;
  status: string; // idle/occupied/disabled
  isMix?: number;
  remark?: string;
}

export interface MaterialItem {
  id: number;
  code: string;
  name: string;
  category: string;
  spec?: string;
  unit?: string;
  barcode?: string;
  ownerName?: string;
  isExpiry?: number;
  isSerial?: number;
  safetyQty?: number;
  price?: number;
  status: number;
  remark?: string;
}

export interface OwnerItem {
  id: number;
  code: string;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  settleType?: string;
  status: number;
  remark?: string;
}

export interface SupplierItem {
  id: number;
  code: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: number;
  remark?: string;
}

export interface CustomerItem {
  id: number;
  code: string;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  status: number;
  remark?: string;
}

export interface ContainerItem {
  id: number;
  code: string;
  containerType: string;
  warehouseCode: string;
  status: string;
  materialCode?: string;
  locationCode?: string;
  remark?: string;
}

// ========================= 仓库 =========================

export const getWarehousePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<WarehouseItem>>>("get", "/wms/master/warehouse/page", { params });

export const addWarehouse = (data: Partial<WarehouseItem>) =>
  http.request<ApiResult<WarehouseItem>>("post", "/wms/master/warehouse/add", { data });

export const updateWarehouse = (data: Partial<WarehouseItem>) =>
  http.request<ApiResult<WarehouseItem>>("post", "/wms/master/warehouse/update", { data });

export const deleteWarehouse = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/master/warehouse/delete", { data: { ids } });

// ========================= 库区 =========================

export const getZonePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<ZoneItem>>>("get", "/wms/master/zone/page", { params });

export const addZone = (data: Partial<ZoneItem>) =>
  http.request<ApiResult<ZoneItem>>("post", "/wms/master/zone/add", { data });

export const updateZone = (data: Partial<ZoneItem>) =>
  http.request<ApiResult<ZoneItem>>("post", "/wms/master/zone/update", { data });

export const deleteZone = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/master/zone/delete", { data: { ids } });

// ========================= 库位 =========================

export const getLocationPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<LocationItem>>>("get", "/wms/master/location/page", { params });

export const addLocation = (data: Partial<LocationItem>) =>
  http.request<ApiResult<LocationItem>>("post", "/wms/master/location/add", { data });

export const updateLocation = (data: Partial<LocationItem>) =>
  http.request<ApiResult<LocationItem>>("post", "/wms/master/location/update", { data });

export const deleteLocation = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/master/location/delete", { data: { ids } });

/** 批量生成库位 */
export const generateLocations = (data: {
  warehouseCode: string;
  zoneCode: string;
  prefix: string;
  row: number;
  col: number;
  floor: number;
}) => http.request<ApiResult<number>>("post", "/wms/master/location/generate", { data });

// ========================= 物料 =========================

export const getMaterialPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<MaterialItem>>>("get", "/wms/master/material/page", { params });

export const addMaterial = (data: Partial<MaterialItem>) =>
  http.request<ApiResult<MaterialItem>>("post", "/wms/master/material/add", { data });

export const updateMaterial = (data: Partial<MaterialItem>) =>
  http.request<ApiResult<MaterialItem>>("post", "/wms/master/material/update", { data });

export const deleteMaterial = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/master/material/delete", { data: { ids } });

// ========================= 货主 =========================

export const getOwnerPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<OwnerItem>>>("get", "/wms/master/owner/page", { params });

export const addOwner = (data: Partial<OwnerItem>) =>
  http.request<ApiResult<OwnerItem>>("post", "/wms/master/owner/add", { data });

export const updateOwner = (data: Partial<OwnerItem>) =>
  http.request<ApiResult<OwnerItem>>("post", "/wms/master/owner/update", { data });

export const deleteOwner = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/master/owner/delete", { data: { ids } });

// ========================= 供应商 =========================

export const getSupplierPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<SupplierItem>>>("get", "/wms/master/supplier/page", { params });

export const addSupplier = (data: Partial<SupplierItem>) =>
  http.request<ApiResult<SupplierItem>>("post", "/wms/master/supplier/add", { data });

export const updateSupplier = (data: Partial<SupplierItem>) =>
  http.request<ApiResult<SupplierItem>>("post", "/wms/master/supplier/update", { data });

export const deleteSupplier = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/master/supplier/delete", { data: { ids } });

// ========================= 客户 =========================

export const getCustomerPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<CustomerItem>>>("get", "/wms/master/customer/page", { params });

export const addCustomer = (data: Partial<CustomerItem>) =>
  http.request<ApiResult<CustomerItem>>("post", "/wms/master/customer/add", { data });

export const updateCustomer = (data: Partial<CustomerItem>) =>
  http.request<ApiResult<CustomerItem>>("post", "/wms/master/customer/update", { data });

export const deleteCustomer = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/master/customer/delete", { data: { ids } });

// ========================= 容器 =========================

export const getContainerPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<ContainerItem>>>("get", "/wms/master/container/page", { params });

export const addContainer = (data: Partial<ContainerItem>) =>
  http.request<ApiResult<ContainerItem>>("post", "/wms/master/container/add", { data });

export const updateContainer = (data: Partial<ContainerItem>) =>
  http.request<ApiResult<ContainerItem>>("post", "/wms/master/container/update", { data });

export const deleteContainer = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/master/container/delete", { data: { ids } });
