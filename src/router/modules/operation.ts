const Layout = () => import("@/layout/index.vue");

export default {
  path: "/operation",
  name: "Operation",
  component: Layout,
  redirect: "/operation/task",
  meta: {
    icon: "ep/operation",
    title: "menus.operation",
    rank: 50
  },
  children: [
    {
      path: "/operation/task",
      name: "OperationTask",
      component: () => import("@/views/operation/task/index.vue"),
      meta: { title: "menus.operationTask" }
    },
    {
      path: "/operation/replenish",
      name: "OperationReplenish",
      component: () => import("@/views/operation/replenish/index.vue"),
      meta: { title: "menus.operationReplenish" }
    },
    {
      path: "/operation/process",
      name: "OperationProcess",
      component: () => import("@/views/operation/process/index.vue"),
      meta: { title: "menus.operationProcess" }
    },
    {
      path: "/operation/crossdock",
      name: "OperationCrossdock",
      component: () => import("@/views/operation/crossdock/index.vue"),
      meta: { title: "menus.operationCrossdock" }
    }
  ]
} satisfies RouteConfigsTable;
