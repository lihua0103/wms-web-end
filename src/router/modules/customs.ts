const Layout = () => import("@/layout/index.vue");

export default {
  path: "/customs",
  name: "Customs",
  component: Layout,
  redirect: "/customs/ledger",
  meta: {
    icon: "ep/stamp",
    title: "menus.customs",
    rank: 95
  },
  children: [
    {
      path: "/customs/ledger",
      name: "CustomsLedger",
      component: () => import("@/views/customs/ledger/index.vue"),
      meta: { title: "menus.customsLedger" }
    },
    {
      path: "/customs/verify",
      name: "CustomsVerify",
      component: () => import("@/views/customs/verify/index.vue"),
      meta: { title: "menus.customsVerify" }
    },
    {
      path: "/customs/release",
      name: "CustomsRelease",
      component: () => import("@/views/customs/release/index.vue"),
      meta: { title: "menus.customsRelease" }
    },
    {
      path: "/customs/triple",
      name: "CustomsTriple",
      component: () => import("@/views/customs/triple/index.vue"),
      meta: { title: "menus.customsTriple" }
    },
    {
      path: "/customs/msglog",
      name: "CustomsMsgLog",
      component: () => import("@/views/customs/msglog/index.vue"),
      meta: { title: "menus.customsMsglog" }
    }
  ]
} satisfies RouteConfigsTable;
