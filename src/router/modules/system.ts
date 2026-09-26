const Layout = () => import("@/layout/index.vue");

export default {
  path: "/system",
  name: "System",
  component: Layout,
  redirect: "/system/user",
  meta: {
    icon: "ep/setting",
    title: "系统管理",
    rank: 10
  },
  children: [
    {
      path: "/system/user",
      name: "SystemUser",
      component: () => import("@/views/system/user/index.vue"),
      meta: { title: "用户管理" }
    },
    {
      path: "/system/role",
      name: "SystemRole",
      component: () => import("@/views/system/role/index.vue"),
      meta: { title: "角色管理" }
    },
    {
      path: "/system/menu",
      name: "SystemMenu",
      component: () => import("@/views/system/menu/index.vue"),
      meta: { title: "菜单管理" }
    },
    {
      path: "/system/org",
      name: "SystemOrg",
      component: () => import("@/views/system/org/index.vue"),
      meta: { title: "组织架构" }
    },
    {
      path: "/system/dict",
      name: "SystemDict",
      component: () => import("@/views/system/dict/index.vue"),
      meta: { title: "数据字典" }
    },
    {
      path: "/system/param",
      name: "SystemParam",
      component: () => import("@/views/system/param/index.vue"),
      meta: { title: "系统参数" }
    },
    {
      path: "/system/log",
      name: "SystemLog",
      component: () => import("@/views/system/log/index.vue"),
      meta: { title: "操作日志" }
    },
    {
      path: "/system/notice",
      name: "SystemNotice",
      component: () => import("@/views/system/notice/index.vue"),
      meta: { title: "消息通知" }
    }
  ]
} satisfies RouteConfigsTable;
