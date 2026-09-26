/**
 * 计费结算模块 API（计费规则 / 费用账单 / 对账单）
 */
import { http } from "@/utils/http";
import type { ApiResult, PageQuery, PageResult } from "./types";

// ========================= 类型定义 =========================

/** 计费规则 */
export interface FeeRuleItem {
  id: number;
  code: string;
  ownerName: string;
  /** 费用类型 storage/operation/handling/material/transport */
  feeType: string;
  /** 计费单位：托/天、件、次、票 */
  unit: string;
  price: number;
  minimumFee: number;
  effectiveFrom: string;
  effectiveTo: string;
  /** 1 启用 / 0 停用 */
  status: number;
  createdAt?: string;
}

/** 费用账单 */
export interface FeeBillItem {
  id: number;
  code: string;
  ownerName: string;
  /** 账期，如 2026-08 */
  period: string;
  feeType: string;
  qty: number;
  amount: number;
  /** pending/confirmed/invoiced/settled/disputed */
  status: string;
  confirmUser?: string;
  createdAt?: string;
}

/** 对账单 */
export interface ReconcileItem {
  id: number;
  code: string;
  ownerName: string;
  period: string;
  billCount: number;
  totalAmount: number;
  diffAmount: number;
  /** pending/confirmed/disputed */
  status: string;
  createdAt?: string;
}

// ========================= 计费规则 =========================

export const getRulePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<FeeRuleItem>>>("get", "/wms/billing/rule/page", { params });

export const addRule = (data: Partial<FeeRuleItem>) =>
  http.request<ApiResult<FeeRuleItem>>("post", "/wms/billing/rule/add", { data });

export const updateRule = (data: Partial<FeeRuleItem>) =>
  http.request<ApiResult<FeeRuleItem>>("post", "/wms/billing/rule/update", { data });

export const deleteRule = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/billing/rule/delete", { data: { ids } });

// ========================= 费用账单 =========================

export const getBillPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<FeeBillItem>>>("get", "/wms/billing/bill/page", { params });

/** 确认账单（待确认 → 已确认） */
export const confirmBill = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/billing/bill/confirm", { data: { id } });

/** 开票（已确认 → 已开票） */
export const invoiceBill = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/billing/bill/invoice", { data: { id } });

/** 结算（已开票 → 已结算） */
export const settleBill = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/billing/bill/settle", { data: { id } });

// ========================= 对账单 =========================

export const getReconcilePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<ReconcileItem>>>("get", "/wms/billing/reconcile/page", { params });

/** 确认对账（待确认 → 已确认） */
export const confirmReconcile = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/billing/reconcile/confirm", { data: { id } });

/** 提出异议（待确认 → 异议中） */
export const disputeReconcile = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/billing/reconcile/dispute", { data: { id } });
