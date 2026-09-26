const Layout = () => import("@/layout/index.vue");

export default {
  path: "/operation",
  name: "Operation",
  component: Layout,
  redirect: "/operation/task",
  meta: {
    icon: "ep/operation",
    title: "库内作业",
    rank: 60
  },
  children: [
    {
      path: "/operation/task",
      name: "OperationTask",
      component: () => import("@/views/operation/task/index.vue"),
      meta: { title: "任务池" }
    },
    {
      path: "/operation/replenish",
      name: "OperationReplenish",
      component: () => import("@/views/operation/replenish/index.vue"),
      meta: { title: "补货管理" }
    },
    {
      path: "/operation/process",
      name: "OperationProcess",
      component: () => import("@/views/operation/process/index.vue"),
      meta: { title: "加工管理" }
    },
    {
      path: "/operation/crossdock",
      name: "OperationCrossdock",
      component: () => import("@/views/operation/crossdock/index.vue"),
      meta: { title: "越库作业" }
    }
  ]
} satisfies RouteConfigsTable;
