// 生成页面占位文件（子代理会替换为完整实现）
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "views");

const pages = [
  ["system", "user", "SystemUser", "用户管理"],
  ["system", "role", "SystemRole", "角色管理"],
  ["system", "menu", "SystemMenu", "菜单管理"],
  ["system", "org", "SystemOrg", "组织架构"],
  ["system", "dict", "SystemDict", "数据字典"],
  ["system", "param", "SystemParam", "系统参数"],
  ["system", "log", "SystemLog", "操作日志"],
  ["system", "notice", "SystemNotice", "消息通知"],
  ["master", "warehouse", "MasterWarehouse", "仓库管理"],
  ["master", "zone", "MasterZone", "库区管理"],
  ["master", "location", "MasterLocation", "库位管理"],
  ["master", "material", "MasterMaterial", "物料管理"],
  ["master", "owner", "MasterOwner", "货主管理"],
  ["master", "supplier", "MasterSupplier", "供应商管理"],
  ["master", "customer", "MasterCustomer", "客户管理"],
  ["master", "container", "MasterContainer", "容器管理"],
  ["inbound", "asn", "InboundAsn", "入库预约"],
  ["inbound", "receipt", "InboundReceipt", "收货管理"],
  ["inbound", "qc", "InboundQc", "质检管理"],
  ["inbound", "putaway", "InboundPutaway", "上架任务"],
  ["inbound", "return", "InboundReturn", "退货入库"],
  ["outbound", "order", "OutboundOrder", "出库单"],
  ["outbound", "wave", "OutboundWave", "波次管理"],
  ["outbound", "picking", "OutboundPicking", "拣货任务"],
  ["outbound", "packing", "OutboundPacking", "复核打包"],
  ["outbound", "shipping", "OutboundShipping", "发货交接"],
  ["inventory", "ledger", "InventoryLedger", "库存台账"],
  ["inventory", "serial", "InventorySerial", "序列号管理"],
  ["inventory", "batch", "InventoryBatch", "批次效期"],
  ["inventory", "move", "InventoryMove", "移库管理"],
  ["inventory", "adjustment", "InventoryAdjustment", "库存调整"],
  ["inventory", "stocktake", "InventoryStocktake", "盘点管理"],
  ["inventory", "warning", "InventoryWarning", "库存预警"],
  ["inventory", "transaction", "InventoryTransaction", "库存流水"],
  ["operation", "task", "OperationTask", "任务池"],
  ["operation", "replenish", "OperationReplenish", "补货管理"],
  ["operation", "process", "OperationProcess", "加工管理"],
  ["operation", "crossdock", "OperationCrossdock", "越库作业"],
  ["transport", "carrier", "TransportCarrier", "承运商"],
  ["transport", "vehicle", "TransportVehicle", "车辆司机"],
  ["transport", "dispatch", "TransportDispatch", "配送单"],
  ["transport", "tracking", "TransportTracking", "在途跟踪"],
  ["billing", "rule", "BillingRule", "计费规则"],
  ["billing", "bill", "BillingBill", "费用账单"],
  ["billing", "reconcile", "BillingReconcile", "对账单"],
  ["report", "dashboard", "ReportDashboard", "库存看板"],
  ["report", "inout", "ReportInout", "出入库报表"],
  ["report", "efficiency", "ReportEfficiency", "作业效率"],
  ["report", "screen", "ReportScreen", "数据大屏"],
  ["integration", "device", "IntegrationDevice", "设备管理"],
  ["integration", "agv", "IntegrationAgv", "AGV调度"],
  ["integration", "devicetask", "IntegrationDeviceTask", "设备任务"],
  ["integration", "config", "IntegrationConfig", "集成配置"],
  ["integration", "apilog", "IntegrationApiLog", "接口日志"]
];

for (const [dir, name, comp, title] of pages) {
  const file = join(root, dir, name, "index.vue");
  mkdirSync(dirname(file), { recursive: true });
  const content = `<script setup lang="ts">
defineOptions({ name: "${comp}" });
</script>

<template>
  <div class="p-4 text-gray-500">${title} - 页面建设中</div>
</template>
`;
  writeFileSync(file, content, "utf8");
}
console.log(`generated ${pages.length} stub pages`);
