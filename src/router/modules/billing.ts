const Layout = () => import("@/layout/index.vue");

export default {
  path: "/billing",
  name: "Billing",
  component: Layout,
  redirect: "/billing/rule",
  meta: {
    icon: "ep/coin",
    title: "计费结算",
    rank: 80
  },
  children: [
    {
      path: "/billing/rule",
      name: "BillingRule",
      component: () => import("@/views/billing/rule/index.vue"),
      meta: { title: "计费规则" }
    },
    {
      path: "/billing/bill",
      name: "BillingBill",
      component: () => import("@/views/billing/bill/index.vue"),
      meta: { title: "费用账单" }
    },
    {
      path: "/billing/reconcile",
      name: "BillingReconcile",
      component: () => import("@/views/billing/reconcile/index.vue"),
      meta: { title: "对账单" }
    }
  ]
} satisfies RouteConfigsTable;
