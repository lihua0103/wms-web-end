const Layout = () => import("@/layout/index.vue");

export default {
  path: "/inbound",
  name: "Inbound",
  component: Layout,
  redirect: "/inbound/asn",
  meta: {
    icon: "ep/download",
    title: "入库管理",
    rank: 30
  },
  children: [
    {
      path: "/inbound/asn",
      name: "InboundAsn",
      component: () => import("@/views/inbound/asn/index.vue"),
      meta: { title: "入库预约" }
    },
    {
      path: "/inbound/receipt",
      name: "InboundReceipt",
      component: () => import("@/views/inbound/receipt/index.vue"),
      meta: { title: "收货管理" }
    },
    {
      path: "/inbound/qc",
      name: "InboundQc",
      component: () => import("@/views/inbound/qc/index.vue"),
      meta: { title: "质检管理" }
    },
    {
      path: "/inbound/putaway",
      name: "InboundPutaway",
      component: () => import("@/views/inbound/putaway/index.vue"),
      meta: { title: "上架任务" }
    },
    {
      path: "/inbound/return",
      name: "InboundReturn",
      component: () => import("@/views/inbound/return/index.vue"),
      meta: { title: "退货入库" }
    }
  ]
} satisfies RouteConfigsTable;
