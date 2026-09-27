/**
 * 系统管理模块 API
 * 说明：后端就绪后按 mock（mock/system.ts）中的路径与响应结构实现即可，本文件零改动。
 * 响应结构约定见 src/api/types.ts
 */
import { http } from "@/utils/http";
import type { ApiResult, PageQuery, PageResult, TreeNode } from "./types";

// ========================= 类型定义 =========================

export interface UserItem {
  id: number;
  username: string;
  nickname: string;
  phone?: string;
  email?: string;
  dept?: string;
  /** 所属仓库编码（多仓） */
  warehouseCodes?: string[];
  roles?: string[];
  status: number; // 1启用 0停用
  remark?: string;
  createdAt?: string;
}

export interface RoleItem {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: number;
  memberCount?: number;
  createdAt?: string;
}

export interface DictTypeItem {
  id: number;
  name: string;
  code: string;
  remark?: string;
  itemCount?: number;
  createdAt?: string;
}

export interface DictDataItem {
  id: number;
  dictCode: string;
  label: string;
  value: string;
  sort: number;
  status: number;
  remark?: string;
}

export interface ParamItem {
  id: number;
  name: string;
  key: string;
  value: string;
  builtIn?: number;
  remark?: string;
  updatedAt?: string;
}

export interface LogItem {
  id: number;
  username: string;
  module: string;
  action: string;
  ip: string;
  status: number; // 1成功 0失败
  duration: number;
  createdAt: string;
}

export interface NoticeItem {
  id: number;
  title: string;
  type: string; // notice通知 announce公告 warning预警
  level: string; // high/normal/low
  content?: string;
  status: number; // 1已读 0未读
  publisher: string;
  createdAt: string;
}

export interface MenuItem extends TreeNode {
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  status?: number;
  permission?: string;
  menuType: string; // dir目录 menu菜单 button按钮
}

export interface OrgItem extends TreeNode {
  name: string;
  type: string; // company公司 warehouse仓库 dept部门
  leader?: string;
  phone?: string;
}

export interface DashboardStats {
  todayInboundCount: number;
  todayOutboundCount: number;
  totalSku: number;
  stockQty: number;
  pendingTaskCount: number;
  warningCount: number;
  /** KPI 环比（%） */
  deltas?: { inbound: number; outbound: number; sku: number; stock: number };
  /** 近7天出入库趋势 */
  trend: { date: string; inbound: number; outbound: number }[];
  /** 各仓库库存占比 */
  warehouseStock: { name: string; value: number }[];
  /** 待办事项 */
  todos: { title: string; count: number; path: string }[];
}

// ========================= 用户管理 =========================

export const getUserPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<UserItem>>>(
    "get",
    "/wms/system/user/page",
    { params }
  );

export const getUserDetail = (id: number) =>
  http.request<ApiResult<UserItem>>("get", "/wms/system/user/detail", {
    params: { id }
  });

export const addUser = (data: Partial<UserItem>) =>
  http.request<ApiResult<UserItem>>("post", "/wms/system/user/add", { data });

export const updateUser = (data: Partial<UserItem>) =>
  http.request<ApiResult<UserItem>>("post", "/wms/system/user/update", {
    data
  });

export const deleteUser = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/system/user/delete", {
    data: { ids }
  });

export const resetUserPwd = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/system/user/reset-pwd", {
    data: { id }
  });

// ========================= 角色管理 =========================

export const getRolePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<RoleItem>>>(
    "get",
    "/wms/system/role/page",
    { params }
  );

export const addRole = (data: Partial<RoleItem>) =>
  http.request<ApiResult<RoleItem>>("post", "/wms/system/role/add", { data });

export const updateRole = (data: Partial<RoleItem>) =>
  http.request<ApiResult<RoleItem>>("post", "/wms/system/role/update", {
    data
  });

export const deleteRole = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/system/role/delete", {
    data: { ids }
  });

/** 角色已授权菜单 id 列表 */
export const getRoleMenus = (id: number) =>
  http.request<ApiResult<number[]>>("get", "/wms/system/role/menus", {
    params: { id }
  });

/** 保存角色菜单授权 */
export const saveRoleMenus = (id: number, menuIds: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/system/role/save-menus", {
    data: { id, menuIds }
  });

// ========================= 菜单管理 =========================

export const getMenuTree = () =>
  http.request<ApiResult<MenuItem[]>>("get", "/wms/system/menu/tree");

export const addMenu = (data: Partial<MenuItem>) =>
  http.request<ApiResult<MenuItem>>("post", "/wms/system/menu/add", { data });

export const updateMenu = (data: Partial<MenuItem>) =>
  http.request<ApiResult<MenuItem>>("post", "/wms/system/menu/update", {
    data
  });

export const deleteMenu = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/system/menu/delete", {
    data: { ids }
  });

// ========================= 组织架构 =========================

export const getOrgTree = () =>
  http.request<ApiResult<OrgItem[]>>("get", "/wms/system/org/tree");

export const addOrg = (data: Partial<OrgItem>) =>
  http.request<ApiResult<OrgItem>>("post", "/wms/system/org/add", { data });

export const updateOrg = (data: Partial<OrgItem>) =>
  http.request<ApiResult<OrgItem>>("post", "/wms/system/org/update", { data });

export const deleteOrg = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/system/org/delete", {
    data: { ids }
  });

// ========================= 数据字典 =========================

export const getDictTypePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<DictTypeItem>>>(
    "get",
    "/wms/system/dict/page",
    { params }
  );

export const addDictType = (data: Partial<DictTypeItem>) =>
  http.request<ApiResult<DictTypeItem>>("post", "/wms/system/dict/add", {
    data
  });

export const updateDictType = (data: Partial<DictTypeItem>) =>
  http.request<ApiResult<DictTypeItem>>("post", "/wms/system/dict/update", {
    data
  });

export const deleteDictType = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/system/dict/delete", {
    data: { ids }
  });

export const getDictDataList = (dictCode: string) =>
  http.request<ApiResult<DictDataItem[]>>("get", "/wms/system/dict-data/list", {
    params: { dictCode }
  });

export const addDictData = (data: Partial<DictDataItem>) =>
  http.request<ApiResult<DictDataItem>>("post", "/wms/system/dict-data/add", {
    data
  });

export const updateDictData = (data: Partial<DictDataItem>) =>
  http.request<ApiResult<DictDataItem>>(
    "post",
    "/wms/system/dict-data/update",
    { data }
  );

export const deleteDictData = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/system/dict-data/delete", {
    data: { ids }
  });

// ========================= 系统参数 =========================

export const getParamPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<ParamItem>>>(
    "get",
    "/wms/system/param/page",
    { params }
  );

export const addParam = (data: Partial<ParamItem>) =>
  http.request<ApiResult<ParamItem>>("post", "/wms/system/param/add", { data });

export const updateParam = (data: Partial<ParamItem>) =>
  http.request<ApiResult<ParamItem>>("post", "/wms/system/param/update", {
    data
  });

export const deleteParam = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/system/param/delete", {
    data: { ids }
  });

// ========================= 操作日志 =========================

export const getLogPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<LogItem>>>("get", "/wms/system/log/page", {
    params
  });

// ========================= 消息通知 =========================

export const getNoticePage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<NoticeItem>>>(
    "get",
    "/wms/system/notice/page",
    { params }
  );

export const addNotice = (data: Partial<NoticeItem>) =>
  http.request<ApiResult<NoticeItem>>("post", "/wms/system/notice/add", {
    data
  });

export const readNotice = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/system/notice/read", {
    data: { ids }
  });

export const deleteNotice = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/system/notice/delete", {
    data: { ids }
  });

// ========================= 工作台统计 =========================

export const getDashboardStats = () =>
  http.request<ApiResult<DashboardStats>>("get", "/wms/dashboard/stats");
