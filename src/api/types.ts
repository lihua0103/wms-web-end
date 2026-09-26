/**
 * 全局接口约定（前后端共同遵守）
 * 后端实现时请保持与 mock（mock/_db.ts）中的响应结构一致，切换后端时前端零改动。
 */

/** 统一响应包装 */
export interface ApiResult<T = any> {
  /** 业务是否成功 */
  success: boolean;
  /** 业务状态码，0=成功 */
  code: number;
  /** 提示信息 */
  msg: string;
  /** 业务数据 */
  data: T;
}

/** 分页查询参数（所有列表接口通用） */
export interface PageQuery {
  /** 页码，从 1 开始 */
  page?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 全局关键字（按接口约定的模糊字段搜索） */
  keyword?: string;
  [key: string]: any;
}

/** 分页响应 */
export interface PageResult<T = any> {
  list: T[];
  total: number;
}

/** 树形节点（组织/仓库结构/物料分类等通用） */
export interface TreeNode {
  id: number | string;
  parentId: number | string | null;
  label: string;
  children?: TreeNode[];
  [key: string]: any;
}

/** 基础实体字段（所有业务表通用） */
export interface BaseEntity {
  id: number;
  /** 单号/编码（唯一业务标识） */
  code?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 创建人 */
  createdBy?: string;
}
