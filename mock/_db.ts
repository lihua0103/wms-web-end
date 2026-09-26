/**
 * mock 数据层基础设施（所有 mock 文件共享）
 *
 * 约定：
 * 1. 业务接口统一响应结构 { success, code, msg, data }，见 src/api/types.ts
 * 2. 列表接口 GET  {prefix}/page  入参 page/pageSize/keyword/其他过滤字段
 * 3. CRUD 统一：GET {prefix}/detail?id= 、POST {prefix}/add 、POST {prefix}/update 、POST {prefix}/delete(ids[])
 * 4. 后端就绪后按相同路径与结构实现即可，前端 src/api 层零改动
 */

/** 统一成功响应 */
export function ok(data: any = null, msg = "ok") {
  return { success: true, code: 0, msg, data };
}

/** 统一失败响应 */
export function fail(msg = "操作失败", code = 1) {
  return { success: false, code, msg, data: null };
}

export function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

/** 当前时间字符串 yyyy-MM-dd HH:mm:ss */
export function nowStr(): string {
  return fmtDate(new Date());
}

/** n 天前/后的时间字符串 */
export function offsetStr(days: number, hours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return fmtDate(d);
}

export function fmtDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** 仅日期 */
export function dayStr(d: Date): string {
  return fmtDate(d).slice(0, 10);
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function pickDate(startDaysAgo: number, endDaysAgo: number): string {
  return dayStr(
    new Date(Date.now() - randInt(endDaysAgo, startDaysAgo) * 86400000)
  );
}

/** 生成种子数据 */
export function genRows(count: number, fn: (i: number) => any): any[] {
  return Array.from({ length: count }, (_, i) => fn(i + 1));
}

/** 单号生成：前缀 + yyyyMMdd + 4位流水 */
export function genCode(prefix: string, seq: number): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  return `${prefix}${date}${String(seq).padStart(4, "0")}`;
}

/** 判断值是否为有效过滤值 */
function isValidFilter(v: any): boolean {
  return v !== undefined && v !== null && v !== "" && v !== "all";
}

/** 按查询参数过滤列表：keyword 对 searchFields 模糊匹配，其余字段精确匹配 */
export function filterList(
  list: any[],
  query: Record<string, any>,
  searchFields: string[] = []
): any[] {
  const { page, pageSize, keyword, ...filters } = query || {};
  return list.filter(row => {
    if (isValidFilter(keyword) && searchFields.length) {
      const hit = searchFields.some(f =>
        String(row[f] ?? "")
          .toLowerCase()
          .includes(String(keyword).toLowerCase())
      );
      if (!hit) return false;
    }
    for (const [k, v] of Object.entries(filters)) {
      if (!isValidFilter(v)) continue;
      if (String(row[k] ?? "") !== String(v)) return false;
    }
    return true;
  });
}

/** 分页包装 */
export function paginate(list: any[], query: Record<string, any> = {}) {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 20);
  const start = (page - 1) * pageSize;
  return ok({
    list: list.slice(start, start + pageSize),
    total: list.length
  });
}

interface CrudOptions {
  /** 接口前缀，如 /wms/system/user */
  prefix: string;
  /** 种子数据 */
  seed: any[];
  /** keyword 与模糊搜索字段 */
  searchFields?: string[];
  idKey?: string;
}

/**
 * 标准 CRUD mock 路由工厂：
 * page / list / detail / add / update / delete
 * 返回数组可直接并入 defineFakeRoute([...])
 */
export function crudRoutes({
  prefix,
  seed,
  searchFields = [],
  idKey = "id"
}: CrudOptions): any[] {
  let list: any[] = deepClone(seed);
  let nextId =
    list.reduce((m, r) => Math.max(m, Number(r[idKey]) || 0), 1000) + 1;

  const findById = (id: any) => list.find(r => String(r[idKey]) === String(id));

  return [
    {
      url: `${prefix}/page`,
      method: "get",
      response: ({ query }) => paginate(filterList(list, query, searchFields), query)
    },
    {
      url: `${prefix}/list`,
      method: "get",
      response: ({ query }) => ok(filterList(list, query, searchFields))
    },
    {
      url: `${prefix}/detail`,
      method: "get",
      response: ({ query }) => {
        const row = findById(query.id);
        return row ? ok(row) : fail("记录不存在");
      }
    },
    {
      url: `${prefix}/add`,
      method: "post",
      response: ({ body }) => {
        const row = {
          ...body,
          [idKey]: nextId++,
          createdAt: nowStr(),
          createdBy: "admin"
        };
        list.unshift(row);
        return ok(row, "新增成功");
      }
    },
    {
      url: `${prefix}/update`,
      method: "post",
      response: ({ body }) => {
        const row = findById(body?.[idKey]);
        if (!row) return fail("记录不存在");
        Object.assign(row, body, { updatedAt: nowStr() });
        return ok(row, "更新成功");
      }
    },
    {
      url: `${prefix}/delete`,
      method: "post",
      response: ({ body }) => {
        const ids: any[] = body?.ids ?? [];
        list = list.filter(r => !ids.some(id => String(id) === String(r[idKey])));
        return ok(true, "删除成功");
      }
    }
  ];
}

/** 标准模块 mock 文件默认导出（防止无 default 导出时被插件告警） */
export default [];
