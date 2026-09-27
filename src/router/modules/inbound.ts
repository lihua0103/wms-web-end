const Layout = () => import("@/layout/index.vue");

export default {
  path: "/inbound",
  name: "Inbound",
  component: Layout,
  redirect: "/inbound/asn",
  meta: {
    icon: "ep/download",
    title: "menus.inbound",
    rank: 30
  },
  children: [
    {
      path: "/inbound/asn",
      name: "InboundAsn",
      component: () => import("@/views/inbound/asn/index.vue"),
      meta: { title: "menus.inboundAppointment" }
    },
    {
      path: "/inbound/receipt",
      name: "InboundReceipt",
      component: () => import("@/views/inbound/receipt/index.vue"),
      meta: { title: "menus.inboundReceipt" }
    },
    {
      path: "/inbound/qc",
      name: "InboundQc",
      component: () => import("@/views/inbound/qc/index.vue"),
      meta: { title: "menus.inboundQc" }
    },
    {
      path: "/inbound/putaway",
      name: "InboundPutaway",
      component: () => import("@/views/inbound/putaway/index.vue"),
      meta: { title: "menus.inboundPutaway" }
    },
    {
      path: "/inbound/return",
      name: "InboundReturn",
      component: () => import("@/views/inbound/return/index.vue"),
      meta: { title: "menus.inboundReturn" }
    }
  ]
} satisfies RouteConfigsTable;
