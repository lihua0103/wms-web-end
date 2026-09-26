const Layout = () => import("@/layout/index.vue");

export default {
  path: "/report",
  name: "Report",
  component: Layout,
  redirect: "/report/dashboard",
  meta: {
    icon: "ep/data-analysis",
    title: "报表分析",
    rank: 90
  },
  children: [
    {
      path: "/report/dashboard",
      name: "ReportDashboard",
      component: () => import("@/views/report/dashboard/index.vue"),
      meta: { title: "库存看板" }
    },
    {
      path: "/report/inout",
      name: "ReportInout",
      component: () => import("@/views/report/inout/index.vue"),
      meta: { title: "出入库报表" }
    },
    {
      path: "/report/efficiency",
      name: "ReportEfficiency",
      component: () => import("@/views/report/efficiency/index.vue"),
      meta: { title: "作业效率" }
    },
    {
      path: "/report/screen",
      name: "ReportScreen",
      component: () => import("@/views/report/screen/index.vue"),
      meta: { title: "数据大屏" }
    }
  ]
} satisfies RouteConfigsTable;
