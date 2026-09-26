const Layout = () => import("@/layout/index.vue");

export default {
  path: "/integration",
  name: "Integration",
  component: Layout,
  redirect: "/integration/device",
  meta: {
    icon: "ep/cpu",
    title: "设备与集成",
    rank: 100
  },
  children: [
    {
      path: "/integration/device",
      name: "IntegrationDevice",
      component: () => import("@/views/integration/device/index.vue"),
      meta: { title: "设备管理" }
    },
    {
      path: "/integration/agv",
      name: "IntegrationAgv",
      component: () => import("@/views/integration/agv/index.vue"),
      meta: { title: "AGV 调度" }
    },
    {
      path: "/integration/devicetask",
      name: "IntegrationDeviceTask",
      component: () => import("@/views/integration/devicetask/index.vue"),
      meta: { title: "设备任务" }
    },
    {
      path: "/integration/config",
      name: "IntegrationConfig",
      component: () => import("@/views/integration/config/index.vue"),
      meta: { title: "集成配置" }
    },
    {
      path: "/integration/apilog",
      name: "IntegrationApiLog",
      component: () => import("@/views/integration/apilog/index.vue"),
      meta: { title: "接口日志" }
    }
  ]
} satisfies RouteConfigsTable;
