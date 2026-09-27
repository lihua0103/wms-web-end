const Layout = () => import("@/layout/index.vue");

export default {
  path: "/system",
  name: "System",
  component: Layout,
  redirect: "/system/user",
  meta: {
    icon: "ep/setting",
    title: "menus.system",
    rank: 100
  },
  children: [
    {
      path: "/system/user",
      name: "SystemUser",
      component: () => import("@/views/system/user/index.vue"),
      meta: { title: "menus.systemUser" }
    },
    {
      path: "/system/role",
      name: "SystemRole",
      component: () => import("@/views/system/role/index.vue"),
      meta: { title: "menus.systemRole" }
    },
    {
      path: "/system/menu",
      name: "SystemMenu",
      component: () => import("@/views/system/menu/index.vue"),
      meta: { title: "menus.systemMenu" }
    },
    {
      path: "/system/org",
      name: "SystemOrg",
      component: () => import("@/views/system/org/index.vue"),
      meta: { title: "menus.systemOrg" }
    },
    {
      path: "/system/dict",
      name: "SystemDict",
      component: () => import("@/views/system/dict/index.vue"),
      meta: { title: "menus.systemDict" }
    },
    {
      path: "/system/param",
      name: "SystemParam",
      component: () => import("@/views/system/param/index.vue"),
      meta: { title: "menus.systemParam" }
    },
    {
      path: "/system/log",
      name: "SystemLog",
      component: () => import("@/views/system/log/index.vue"),
      meta: { title: "menus.systemLog" }
    },
    {
      path: "/system/notice",
      name: "SystemNotice",
      component: () => import("@/views/system/notice/index.vue"),
      meta: { title: "menus.systemNotice" }
    }
  ]
} satisfies RouteConfigsTable;
