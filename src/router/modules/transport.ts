const Layout = () => import("@/layout/index.vue");

export default {
  path: "/transport",
  name: "Transport",
  component: Layout,
  redirect: "/transport/dispatch",
  meta: {
    icon: "ep/van",
    title: "运输管理",
    rank: 70
  },
  children: [
    {
      path: "/transport/carrier",
      name: "TransportCarrier",
      component: () => import("@/views/transport/carrier/index.vue"),
      meta: { title: "承运商" }
    },
    {
      path: "/transport/vehicle",
      name: "TransportVehicle",
      component: () => import("@/views/transport/vehicle/index.vue"),
      meta: { title: "车辆司机" }
    },
    {
      path: "/transport/dispatch",
      name: "TransportDispatch",
      component: () => import("@/views/transport/dispatch/index.vue"),
      meta: { title: "配送单" }
    },
    {
      path: "/transport/tracking",
      name: "TransportTracking",
      component: () => import("@/views/transport/tracking/index.vue"),
      meta: { title: "在途跟踪" }
    }
  ]
} satisfies RouteConfigsTable;
