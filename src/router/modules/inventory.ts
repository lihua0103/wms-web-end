const Layout = () => import("@/layout/index.vue");

export default {
  path: "/inventory",
  name: "Inventory",
  component: Layout,
  redirect: "/inventory/ledger",
  meta: {
    icon: "ep/box",
    title: "库存管理",
    rank: 50
  },
  children: [
    {
      path: "/inventory/ledger",
      name: "InventoryLedger",
      component: () => import("@/views/inventory/ledger/index.vue"),
      meta: { title: "库存台账" }
    },
    {
      path: "/inventory/serial",
      name: "InventorySerial",
      component: () => import("@/views/inventory/serial/index.vue"),
      meta: { title: "序列号管理" }
    },
    {
      path: "/inventory/batch",
      name: "InventoryBatch",
      component: () => import("@/views/inventory/batch/index.vue"),
      meta: { title: "批次效期" }
    },
    {
      path: "/inventory/move",
      name: "InventoryMove",
      component: () => import("@/views/inventory/move/index.vue"),
      meta: { title: "移库管理" }
    },
    {
      path: "/inventory/adjustment",
      name: "InventoryAdjustment",
      component: () => import("@/views/inventory/adjustment/index.vue"),
      meta: { title: "库存调整" }
    },
    {
      path: "/inventory/stocktake",
      name: "InventoryStocktake",
      component: () => import("@/views/inventory/stocktake/index.vue"),
      meta: { title: "盘点管理" }
    },
    {
      path: "/inventory/warning",
      name: "InventoryWarning",
      component: () => import("@/views/inventory/warning/index.vue"),
      meta: { title: "库存预警" }
    },
    {
      path: "/inventory/transaction",
      name: "InventoryTransaction",
      component: () => import("@/views/inventory/transaction/index.vue"),
      meta: { title: "库存流水" }
    }
  ]
} satisfies RouteConfigsTable;
