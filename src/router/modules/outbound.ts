const Layout = () => import("@/layout/index.vue");

export default {
  path: "/outbound",
  name: "Outbound",
  component: Layout,
  redirect: "/outbound/order",
  meta: {
    icon: "ep/upload",
    title: "出库管理",
    rank: 40
  },
  children: [
    {
      path: "/outbound/order",
      name: "OutboundOrder",
      component: () => import("@/views/outbound/order/index.vue"),
      meta: { title: "出库单" }
    },
    {
      path: "/outbound/wave",
      name: "OutboundWave",
      component: () => import("@/views/outbound/wave/index.vue"),
      meta: { title: "波次管理" }
    },
    {
      path: "/outbound/picking",
      name: "OutboundPicking",
      component: () => import("@/views/outbound/picking/index.vue"),
      meta: { title: "拣货任务" }
    },
    {
      path: "/outbound/packing",
      name: "OutboundPacking",
      component: () => import("@/views/outbound/packing/index.vue"),
      meta: { title: "复核打包" }
    },
    {
      path: "/outbound/shipping",
      name: "OutboundShipping",
      component: () => import("@/views/outbound/shipping/index.vue"),
      meta: { title: "发货交接" }
    }
  ]
} satisfies RouteConfigsTable;
