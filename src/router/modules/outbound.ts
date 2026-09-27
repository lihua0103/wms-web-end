const Layout = () => import("@/layout/index.vue");

export default {
  path: "/outbound",
  name: "Outbound",
  component: Layout,
  redirect: "/outbound/order",
  meta: {
    icon: "ep/upload",
    title: "menus.outbound",
    rank: 40
  },
  children: [
    {
      path: "/outbound/order",
      name: "OutboundOrder",
      component: () => import("@/views/outbound/order/index.vue"),
      meta: { title: "menus.outboundOrder" }
    },
    {
      path: "/outbound/wave",
      name: "OutboundWave",
      component: () => import("@/views/outbound/wave/index.vue"),
      meta: { title: "menus.outboundWave" }
    },
    {
      path: "/outbound/picking",
      name: "OutboundPicking",
      component: () => import("@/views/outbound/picking/index.vue"),
      meta: { title: "menus.outboundPicking" }
    },
    {
      path: "/outbound/packing",
      name: "OutboundPacking",
      component: () => import("@/views/outbound/packing/index.vue"),
      meta: { title: "menus.outboundPacking" }
    },
    {
      path: "/outbound/shipping",
      name: "OutboundShipping",
      component: () => import("@/views/outbound/shipping/index.vue"),
      meta: { title: "menus.outboundShipping" }
    }
  ]
} satisfies RouteConfigsTable;
