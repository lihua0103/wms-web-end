const Layout = () => import("@/layout/index.vue");

export default {
  path: "/inventory",
  name: "Inventory",
  component: Layout,
  redirect: "/inventory/ledger",
  meta: {
    icon: "ep/box",
    title: "menus.inventory",
    rank: 20
  },
  children: [
    {
      path: "/inventory/ledger",
      name: "InventoryLedger",
      component: () => import("@/views/inventory/ledger/index.vue"),
      meta: { title: "menus.inventoryLedger" }
    },
    {
      path: "/inventory/serial",
      name: "InventorySerial",
      component: () => import("@/views/inventory/serial/index.vue"),
      meta: { title: "menus.inventorySerial" }
    },
    {
      path: "/inventory/batch",
      name: "InventoryBatch",
      component: () => import("@/views/inventory/batch/index.vue"),
      meta: { title: "menus.inventoryBatch" }
    },
    {
      path: "/inventory/move",
      name: "InventoryMove",
      component: () => import("@/views/inventory/move/index.vue"),
      meta: { title: "menus.inventoryMove" }
    },
    {
      path: "/inventory/adjustment",
      name: "InventoryAdjustment",
      component: () => import("@/views/inventory/adjustment/index.vue"),
      meta: { title: "menus.inventoryAdjustment" }
    },
    {
      path: "/inventory/stocktake",
      name: "InventoryStocktake",
      component: () => import("@/views/inventory/stocktake/index.vue"),
      meta: { title: "menus.inventoryStocktake" }
    },
    {
      path: "/inventory/warning",
      name: "InventoryWarning",
      component: () => import("@/views/inventory/warning/index.vue"),
      meta: { title: "menus.inventoryWarning" }
    },
    {
      path: "/inventory/transaction",
      name: "InventoryTransaction",
      component: () => import("@/views/inventory/transaction/index.vue"),
      meta: { title: "menus.inventoryTransaction" }
    }
  ]
} satisfies RouteConfigsTable;
