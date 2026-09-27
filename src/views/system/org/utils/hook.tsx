import { ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getOrgTree, addOrg, updateOrg, deleteOrg } from "@/api/system";
import type { OrgItem } from "@/api/system";
import type { DictItem } from "@/constants/wms";
import { dictLabel, dictTag } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import Plus from "~icons/ep/plus";
import formComp from "../form.vue";

/** 组织类型选项 */
export const orgTypeOptions: DictItem[] = [
  { label: $t("system.org.typeCompany"), value: "company", tag: "" },
  { label: $t("system.org.typeWarehouse"), value: "warehouse", tag: "success" },
  { label: $t("system.org.typeDept"), value: "dept", tag: "warning" }
];

/** 将组织树拍平为上级组织下拉选项 */
function flattenOptions(
  tree: OrgItem[],
  depth = 0
): { id: number; label: string }[] {
  const res: { id: number; label: string }[] = [];
  const walk = (nodes: OrgItem[], d: number) => {
    for (const n of nodes) {
      res.push({ id: Number(n.id), label: `${"　".repeat(d)}${n.name}` });
      if (n.children?.length) walk(n.children as OrgItem[], d + 1);
    }
  };
  walk(tree, depth);
  return res;
}

export function useOrg() {
  const loading = ref(false);
  const dataList = ref<OrgItem[]>([]);

  const columns: TableColumnList = [
    { label: $t("system.org.name"), prop: "name", minWidth: 180 },
    {
      label: $t("common.columns.type"),
      prop: "type",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(orgTypeOptions, row.type)}>
          {dictLabel(orgTypeOptions, row.type)}
        </el-tag>
      )
    },
    { label: $t("system.org.leader"), prop: "leader", minWidth: 100 },
    { label: $t("system.org.phone"), prop: "phone", minWidth: 120 },
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

  function operationButtons(row: OrgItem): TableOperationButton[] {
    return [
      {
        label: $t("system.org.addChild"),
        icon: Plus,
        onClick: () => openDialog($t("system.org.addChildOrg"), undefined, row)
      },
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("system.org.editOrg"), row)
      },
      {
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDelete(row)
      }
    ];
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getOrgTree();
      dataList.value = data;
    } finally {
      loading.value = false;
    }
  }

  /** 新增/编辑组织弹窗，parentRow 传入时为"新增子级" */
  function openDialog(title: string, row?: OrgItem, parentRow?: OrgItem) {
    addDialog({
      title,
      width: "42%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          parentId: row?.parentId ?? parentRow?.id ?? null,
          type: row?.type ?? "dept",
          name: row?.name ?? "",
          leader: row?.leader ?? "",
          phone: row?.phone ?? ""
        },
        parentOptions: flattenOptions(dataList.value)
      },
      beforeSure: (done, { options }) => {
        const formInline = (options.props as { formInline: Partial<OrgItem> })
          .formInline;
        const req = formInline.id ? updateOrg(formInline) : addOrg(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("system.org.editSuccess")
              : $t("system.org.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: OrgItem) {
    ElMessageBox.confirm(
      $t("system.org.deleteConfirm", { name: row.name }),
      $t("system.org.tip"),
      { type: "warning" }
    ).then(() => {
      deleteOrg([Number(row.id)]).then(() => {
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
