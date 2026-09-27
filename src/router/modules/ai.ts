const Layout = () => import("@/layout/index.vue");

export default {
  path: "/ai",
  name: "Ai",
  component: Layout,
  redirect: "/ai/workflow",
  meta: {
    icon: "ep/magic-stick",
    title: "menus.ai",
    rank: 85
  },
  children: [
    {
      path: "/ai/workflow",
      name: "AiWorkflow",
      component: () => import("@/views/ai/workflow/index.vue"),
      meta: { title: "menus.aiWorkflow" }
    },
    {
      path: "/ai/run",
      name: "AiRun",
      component: () => import("@/views/ai/run/index.vue"),
      meta: { title: "menus.aiRun" }
    }
  ]
} satisfies RouteConfigsTable;
