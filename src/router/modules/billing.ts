const Layout = () => import("@/layout/index.vue");

export default {
  path: "/billing",
  name: "Billing",
  component: Layout,
  redirect: "/billing/rule",
  meta: {
    icon: "ep/coin",
    title: "menus.billing",
    rank: 70
  },
  children: [
    {
      path: "/billing/rule",
      name: "BillingRule",
      component: () => import("@/views/billing/rule/index.vue"),
      meta: { title: "menus.billingRule" }
    },
    {
      path: "/billing/bill",
      name: "BillingBill",
      component: () => import("@/views/billing/bill/index.vue"),
      meta: { title: "menus.billingBill" }
    },
    {
      path: "/billing/reconcile",
      name: "BillingReconcile",
      component: () => import("@/views/billing/reconcile/index.vue"),
      meta: { title: "menus.billingReconcile" }
    }
  ]
} satisfies RouteConfigsTable;
