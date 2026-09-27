const Layout = () => import("@/layout/index.vue");

export default {
  path: "/integration",
  name: "Integration",
  component: Layout,
  redirect: "/integration/device",
  meta: {
    icon: "ep/cpu",
    title: "menus.integration",
    rank: 90
  },
  children: [
    {
      path: "/integration/device",
      name: "IntegrationDevice",
      component: () => import("@/views/integration/device/index.vue"),
      meta: { title: "menus.integrationDevice" }
    },
    {
      path: "/integration/agv",
      name: "IntegrationAgv",
      component: () => import("@/views/integration/agv/index.vue"),
      meta: { title: "menus.integrationAgv" }
    },
    {
      path: "/integration/devicetask",
      name: "IntegrationDeviceTask",
      component: () => import("@/views/integration/devicetask/index.vue"),
      meta: { title: "menus.integrationDeviceTask" }
    },
    {
      path: "/integration/config",
      name: "IntegrationConfig",
      component: () => import("@/views/integration/config/index.vue"),
      meta: { title: "menus.integrationConfig" }
    },
    {
      path: "/integration/apilog",
      name: "IntegrationApiLog",
      component: () => import("@/views/integration/apilog/index.vue"),
      meta: { title: "menus.integrationApilog" }
    }
  ]
} satisfies RouteConfigsTable;
