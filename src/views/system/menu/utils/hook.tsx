import { ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getMenuTree, addMenu, updateMenu, deleteMenu } from "@/api/system";
import type { MenuItem } from "@/api/system";
import type { DictItem } from "@/constants/wms";
import { dictLabel, dictTag } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import Plus from "~icons/ep/plus";
import formComp from "../form.vue";

/** 菜单类型选项 */
export const menuTypeOptions: DictItem[] = [
  { label: $t("system.menu.typeDir"), value: "dir", tag: "" },
  { label: $t("system.menu.typeMenu"), value: "menu", tag: "success" },
  { label: $t("system.menu.typeButton"), value: "button", tag: "warning" }
];

/** 将菜单树拍平为上级菜单下拉选项 */
function flattenOptions(
  tree: MenuItem[],
  depth = 0
): { id: number; label: string }[] {
  const res: { id: number; label: string }[] = [];
  const walk = (nodes: MenuItem[], d: number) => {
    for (const n of nodes) {
      res.push({ id: Number(n.id), label: `${"　".repeat(d)}${n.name}` });
      if (n.children?.length) walk(n.children as MenuItem[], d + 1);
    }
  };
  walk(tree, depth);
  return res;
}

export function useMenu() {
  const loading = ref(false);
  const dataList = ref<MenuItem[]>([]);

  const columns: TableColumnList = [
    { label: $t("system.menu.name"), prop: "name", minWidth: 140 },
    {
      label: $t("common.columns.type"),
      prop: "menuType",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(menuTypeOptions, row.menuType)}>
          {dictLabel(menuTypeOptions, row.menuType)}
        </el-tag>
      )
    },
    { label: $t("system.menu.icon"), prop: "icon", minWidth: 100 },
    { label: $t("system.menu.path"), prop: "path", minWidth: 130 },
    { label: $t("system.menu.component"), prop: "component", minWidth: 140 },
    {
      label: $t("system.menu.permission"),
      prop: "permission",
      minWidth: 140
    },
    { label: $t("system.menu.sort"), prop: "sort", minWidth: 60 },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1
            ? $t("common.buttons.enabled")
            : $t("common.buttons.disabled")}
        </el-tag>
      )
    },
    {
      fixed: "right",
      label: $t("common.columns.operation"),
      minWidth: 190,
      showOverflowTooltip: false,
      cellRenderer: ({ row }) => (
        <ReTableOperation buttons={operationButtons(row)} />
      )
    }
  ];

  function operationButtons(row: MenuItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.menuType !== "button") {
      buttons.push({
        label: $t("system.menu.addChild"),
        icon: Plus,
        onClick: () =>
          openDialog($t("system.menu.addChildMenu"), undefined, row)
      });
    }
    buttons.push(
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("system.menu.editMenu"), row)
      },
      {
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDelete(row)
      }
    );
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getMenuTree();
      dataList.value = data;
    } finally {
      loading.value = false;
    }
  }

  /** 新增/编辑菜单弹窗，parentRow 传入时为"新增子菜单" */
  function openDialog(title: string, row?: MenuItem, parentRow?: MenuItem) {
    addDialog({
      title,
      width: "46%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          parentId: row?.parentId ?? parentRow?.id ?? null,
          menuType: row?.menuType ?? "menu",
          name: row?.name ?? "",
          path: row?.path ?? "",
          component: row?.component ?? "",
          icon: row?.icon ?? "",
          permission: row?.permission ?? "",
          sort: row?.sort ?? 1,
          status: row?.status ?? 1
        },
        parentOptions: flattenOptions(dataList.value)
      },
      beforeSure: (done, { options }) => {
        const formInline = (options.props as { formInline: Partial<MenuItem> })
          .formInline;
        const req = formInline.id
          ? updateMenu(formInline)
          : addMenu(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("system.menu.editSuccess")
              : $t("system.menu.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: MenuItem) {
    ElMessageBox.confirm(
      $t("system.menu.deleteConfirm", { name: row.name }),
      $t("system.menu.tip"),
      { type: "warning" }
    ).then(() => {
      deleteMenu([Number(row.id)]).then(() => {
        message($t("common.tips.deleteSuccess"), { type: "success" });
        onSearch();
      });
    });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    loading,
    columns,
    dataList,
    onSearch,
    openDialog,
    handleDelete
  };
}
