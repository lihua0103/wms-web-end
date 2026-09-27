/**
 * 海关对接模块 API（海关账册 / 核注清单 / 核放单 / 三单对碰 / 海关报文）
 */
import { http } from "@/utils/http";
import type { ApiResult, PageQuery, PageResult } from "./types";

// ========================= 类型定义 =========================

/** 账册料号底账明细 */
export interface CustomsGoodsItem {
  /** 海关料号 */
  gNo: string;
  /** 物料编码 */
  skuCode: string;
  /** 品名 */
  name: string;
  /** 单位 */
  unit: string;
  /** 备案数量 */
  declaredQty: number;
  /** 已核扣数量 */
  usedQty: number;
  /** 可用量 */
  availQty: number;
}

/** 海关电子账册 */
export interface CustomsLedgerItem {
  id: number;
  /** 账册编号，如 L2631W00001 */
  ledgerNo: string;
  /** bonded_logistics/process_trade/export_warehouse */
  ledgerType: string;
  /** 企业名称 */
  enterpriseName: string;
  /** 海关注册编码（10 位） */
  customsCode: string;
  /** 统一社会信用代码 */
  creditCode: string;
  /** 监管方式 1210/1239/1233/0110/5034 */
  supervisionMode: string;
  /** 生效日期 */
  validFrom: string;
  /** 失效日期 */
  validTo: string;
  /** active/changing/expired/cancelled */
  status: string;
  /** 料号底账明细 */
  goods?: CustomsGoodsItem[];
  remark?: string;
}

/** 核注清单商品明细 */
export interface VerifyGoodsItem {
  /** 海关料号 */
  gNo: string;
  /** 商品编号（HS 编码） */
  hsCode: string;
  /** 品名 */
  name: string;
  /** 申报数量 */
  qty: number;
  /** 单位 */
  unit: string;
  /** 申报单价 */
  price: number;
  /** 币制 */
  currency: string;
  /** 毛重（kg） */
  grossWeight: number;
  /** 净重（kg） */
  netWeight: number;
}

/** 保税核注清单 */
export interface VerifyListItem {
  id: number;
  /** 清单编号，前缀 HZ */
  listNo: string;
  /** in 入区 / out 出区 */
  listType: string;
  /** 监管方式 */
  supervisionMode: string;
  /** 关联 WMS 出入库单号 */
  bizNo: string;
  /** 关联账册编号 */
  ledgerNo: string;
  /** 总件数 */
  packCount: number;
  /** 总毛重 kg */
  grossWeight: number;
  /** 总净重 kg */
  netWeight: number;
  /** 草稿/已申报/审核通过/已核扣/退单/已作废 */
  status: string;
  declareTime?: string;
  declareBy?: string;
  /** 退单原因 */
  refusedReason?: string;
  /** 商品明细 */
  goods?: VerifyGoodsItem[];
  remark?: string;
  createdAt?: string;
}

/** 核放单 */
export interface ReleasePassItem {
  id: number;
  /** 核放单号，前缀 HF */
  passNo: string;
  /** in 入区 / out 出区 */
  direction: string;
  /** 车牌号 */
  vehicleNo: string;
  /** 司机姓名 */
  driverName: string;
  /** 司机电话 */
  driverPhone: string;
  /** 集装箱号 */
  containerNo?: string;
  /** 关联核注清单编号 */
  listNo: string;
  /** 关联出入库单号 */
  bizNo: string;
  /** 件数 */
  packCount: number;
  /** 毛重 kg */
  grossWeight: number;
  /** 待申报/已申报/已放行/已过卡/已作废 */
  status: string;
  declareTime?: string;
  releaseTime?: string;
  crossTime?: string;
  remark?: string;
  createdAt?: string;
}

/** 三单单证（订单/支付单/运单） */
export interface TripleDocItem {
  id: number;
  /** 单证编号，前缀 SD */
  docNo: string;
  /** order 订单 / payment 支付单 / logistics 运单 */
  docType: string;
  /** 电商平台 tmall/jd/pdd/douyin/kaola */
  platform: string;
  /** 关联订单号 */
  orderNo: string;
  /** 外部单号：支付流水号 / 物流运单号 */
  extNo: string;
  /** 订单/支付金额（运单为 0） */
  amount: number;
  /** 收件人 */
  consignee: string;
  /** 待推送/已推送/对碰成功/对碰失败 */
  status: string;
  /** 失败原因 */
  failReason?: string;
  pushTime?: string;
  matchTime?: string;
  createdAt?: string;
}

/** 海关报文日志 */
export interface CustomsMsgLogItem {
  id: number;
  /** 报文编号，前缀 MSG */
  msgNo: string;
  /** verify/release/triple/summary/ledger */
  msgType: string;
  /** single_window/golden_phase2/ceb_platform */
  channel: string;
  /** up 上行 / down 下行 */
  direction: string;
  /** 关联单证号 */
  bizNo: string;
  /** success/fail/pending/resend */
  status: string;
  /** 重发次数 */
  resendCount: number;
  /** 错误信息 */
  errorMsg?: string;
  /** 报文内容（JSON 字符串） */
  content: string;
  /** 回执内容（JSON 字符串） */
  response?: string;
  createdAt?: string;
}

// ========================= 海关账册 =========================

export const getLedgerPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<CustomsLedgerItem>>>(
    "get",
    "/wms/customs/ledger/page",
    { params }
  );

export const addLedger = (data: Partial<CustomsLedgerItem>) =>
  http.request<ApiResult<CustomsLedgerItem>>(
    "post",
    "/wms/customs/ledger/add",
    {
      data
    }
  );

export const updateLedger = (data: Partial<CustomsLedgerItem>) =>
  http.request<ApiResult<CustomsLedgerItem>>(
    "post",
    "/wms/customs/ledger/update",
    { data }
  );

export const deleteLedger = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/customs/ledger/delete", {
    data: { ids }
  });

// ========================= 核注清单 =========================

export const getVerifyListPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<VerifyListItem>>>(
    "get",
    "/wms/customs/verifylist/page",
    { params }
  );

/** 核注清单申报（草稿 → 已申报） */
export const declareVerifyList = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/customs/verifylist/declare", {
    data: { id }
  });

/** 同步海关回执（已申报 → 审核通过 → 已核扣；退单 → refused） */
export const syncVerifyReceipt = (id: number) =>
  http.request<ApiResult<boolean>>(
    "post",
    "/wms/customs/verifylist/sync-receipt",
    { data: { id } }
  );

// ========================= 核放单 =========================

export const getReleasePassPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<ReleasePassItem>>>(
    "get",
    "/wms/customs/release/page",
    { params }
  );

/** 核放单申报（待申报 → 已申报） */
export const declareReleasePass = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/customs/release/declare", {
    data: { id }
  });

/** 放行回执（已申报 → 已放行） */
export const releasePass = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/customs/release/release", {
    data: { id }
  });

/** 过卡确认（已放行 → 已过卡） */
export const crossReleasePass = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/customs/release/cross", {
    data: { id }
  });

/** 作废核放单 */
export const cancelReleasePass = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/customs/release/cancel", {
    data: { id }
  });

// ========================= 三单对碰 =========================

export const getTripleDocPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<TripleDocItem>>>(
    "get",
    "/wms/customs/tripledoc/page",
    { params }
  );

/** 推送三单至海关（待推送/对碰失败 → 已推送 → 对碰成功） */
export const pushTripleDoc = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/customs/tripledoc/push", {
    data: { id }
  });

// ========================= 海关报文 =========================

export const getMsgLogPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<CustomsMsgLogItem>>>(
    "get",
    "/wms/customs/msglog/page",
    { params }
  );

/** 失败报文重发 */
export const resendMsgLog = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/customs/msglog/resend", {
    data: { id }
  });
