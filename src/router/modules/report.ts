const Layout = () => import("@/layout/index.vue");

export default {
  path: "/report",
  name: "Report",
  component: Layout,
  redirect: "/report/dashboard",
  meta: {
    icon: "ep/data-analysis",
    title: "menus.report",
    rank: 80
  },
  children: [
    {
      path: "/report/dashboard",
      name: "ReportDashboard",
      component: () => import("@/views/report/dashboard/index.vue"),
      meta: { title: "menus.reportDashboard" }
    },
    {
      path: "/report/inout",
      name: "ReportInout",
      component: () => import("@/views/report/inout/index.vue"),
      meta: { title: "menus.reportInout" }
    },
    {
      path: "/report/efficiency",
      name: "ReportEfficiency",
      component: () => import("@/views/report/efficiency/index.vue"),
      meta: { title: "menus.reportEfficiency" }
    },
    {
      path: "/report/screen",
      name: "ReportScreen",
      component: () => import("@/views/report/screen/index.vue"),
      meta: { title: "menus.reportScreen" }
    }
  ]
} satisfies RouteConfigsTable;
