const Layout = () => import("@/layout/index.vue");

export default {
  path: "/master",
  name: "Master",
  component: Layout,
  redirect: "/master/warehouse",
  meta: {
    icon: "ep/office-building",
    title: "menus.master",
    rank: 10
  },
  children: [
    {
      path: "/master/warehouse",
      name: "MasterWarehouse",
      component: () => import("@/views/master/warehouse/index.vue"),
      meta: { title: "menus.masterWarehouse" }
    },
    {
      path: "/master/zone",
      name: "MasterZone",
      component: () => import("@/views/master/zone/index.vue"),
      meta: { title: "menus.masterZone" }
    },
    {
      path: "/master/location",
      name: "MasterLocation",
      component: () => import("@/views/master/location/index.vue"),
      meta: { title: "menus.masterLocation" }
    },
    {
      path: "/master/material",
      name: "MasterMaterial",
      component: () => import("@/views/master/material/index.vue"),
      meta: { title: "menus.masterMaterial" }
    },
    {
      path: "/master/owner",
      name: "MasterOwner",
      component: () => import("@/views/master/owner/index.vue"),
      meta: { title: "menus.masterOwner" }
    },
    {
      path: "/master/supplier",
      name: "MasterSupplier",
      component: () => import("@/views/master/supplier/index.vue"),
      meta: { title: "menus.masterSupplier" }
    },
    {
      path: "/master/customer",
      name: "MasterCustomer",
      component: () => import("@/views/master/customer/index.vue"),
      meta: { title: "menus.masterCustomer" }
    },
    {
      path: "/master/container",
      name: "MasterContainer",
      component: () => import("@/views/master/container/index.vue"),
      meta: { title: "menus.masterContainer" }
    }
  ]
} satisfies RouteConfigsTable;
