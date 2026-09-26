const Layout = () => import("@/layout/index.vue");

export default {
  path: "/master",
  name: "Master",
  component: Layout,
  redirect: "/master/warehouse",
  meta: {
    icon: "ep/office-building",
    title: "主数据",
    rank: 20
  },
  children: [
    {
      path: "/master/warehouse",
      name: "MasterWarehouse",
      component: () => import("@/views/master/warehouse/index.vue"),
      meta: { title: "仓库管理" }
    },
    {
      path: "/master/zone",
      name: "MasterZone",
      component: () => import("@/views/master/zone/index.vue"),
      meta: { title: "库区管理" }
    },
    {
      path: "/master/location",
      name: "MasterLocation",
      component: () => import("@/views/master/location/index.vue"),
      meta: { title: "库位管理" }
    },
    {
      path: "/master/material",
      name: "MasterMaterial",
      component: () => import("@/views/master/material/index.vue"),
      meta: { title: "物料管理" }
    },
    {
      path: "/master/owner",
      name: "MasterOwner",
      component: () => import("@/views/master/owner/index.vue"),
      meta: { title: "货主管理" }
    },
    {
      path: "/master/supplier",
      name: "MasterSupplier",
      component: () => import("@/views/master/supplier/index.vue"),
      meta: { title: "供应商管理" }
    },
    {
      path: "/master/customer",
      name: "MasterCustomer",
      component: () => import("@/views/master/customer/index.vue"),
      meta: { title: "客户管理" }
    },
    {
      path: "/master/container",
      name: "MasterContainer",
      component: () => import("@/views/master/container/index.vue"),
      meta: { title: "容器管理" }
    }
  ]
} satisfies RouteConfigsTable;
