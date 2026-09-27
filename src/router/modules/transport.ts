const Layout = () => import("@/layout/index.vue");

export default {
  path: "/transport",
  name: "Transport",
  component: Layout,
  redirect: "/transport/dispatch",
  meta: {
    icon: "ep/van",
    title: "menus.transport",
    rank: 60
  },
  children: [
    {
      path: "/transport/carrier",
      name: "TransportCarrier",
      component: () => import("@/views/transport/carrier/index.vue"),
      meta: { title: "menus.transportCarrier" }
    },
    {
      path: "/transport/vehicle",
      name: "TransportVehicle",
      component: () => import("@/views/transport/vehicle/index.vue"),
      meta: { title: "menus.transportVehicle" }
    },
    {
      path: "/transport/dispatch",
      name: "TransportDispatch",
      component: () => import("@/views/transport/dispatch/index.vue"),
      meta: { title: "menus.transportDispatch" }
    },
    {
      path: "/transport/tracking",
      name: "TransportTracking",
      component: () => import("@/views/transport/tracking/index.vue"),
      meta: { title: "menus.transportTracking" }
    }
  ]
} satisfies RouteConfigsTable;
