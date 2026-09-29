import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getMovePage, addMove, executeMove, cancelMove } from "@/api/inventory";
import type { MoveItem } from "@/api/inventory";
import {
  moveTypeOptions,
  docStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import VideoPlay from "~icons/ep/video-play";
import formComp from "../form.vue";

export function useMove() {
  const form = reactive({
    code: "",
    moveType: "",
    materialCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<MoveItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("inventory.move.moveNo"), prop: "code", minWidth: 120 },
    {
      label: $t("inventory.move.moveType"),
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(moveTypeOptions, row.moveType)
    },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 100
    },
    {
      label: $t("inventory.move.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inventory.move.materialName"),
      prop: "materialName",
      minWidth: 130
    },
    { label: $t("inventory.move.batch"), prop: "batchNo", minWidth: 90 },
    {
      label: $t("inventory.move.fromLocation"),
      prop: "fromLocation",
      minWidth: 90
    },
    {
      label: $t("inventory.move.toLocation"),
      prop: "toLocation",
      minWidth: 90
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 80 },
    {
      label: $t("common.columns.status"),
      minWidth: 100,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(docStatusOptions, row.status)}>
          {dictLabel(docStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: $t("inventory.move.operator"), prop: "operator", minWidth: 90 },
    {
      label: $t("common.columns.createTime"),
      prop: "createdAt",
      minWidth: 150
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

  function operationButtons(row: MoveItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status === "pending" || row.status === "processing") {
      buttons.push({
        label: $t("common.buttons.execute"),
        type: "primary",
        icon: VideoPlay,
        onClick: () => onAction(row, "execute")
      });
    }
    if (row.status === "pending" || row.status === "processing") {
      buttons.push({
        label: $t("common.buttons.cancelOrder"),
        type: "danger",
        onClick: () => onAction(row, "cancel")
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getMovePage({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...form
      });
      dataList.value = data.list;
      pagination.total = data.total;
    } finally {
      loading.value = false;
    }
  }

  function resetForm(formEl: { resetFields: () => void }) {
    formEl.resetFields();
    onSearch();
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  /** 新增移库单 */
  function openDialog() {
    addDialog({
      title: $t("inventory.move.addTitle"),
      width: "46%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          moveType: "location",
          warehouseCode: "WH001",
          materialCode: "",
          materialName: "",
          batchNo: "",
          fromLocation: "",
          toLocation: "",
          qty: 1
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (options.props as { formInline: Partial<MoveItem> })
          .formInline;
        addMove(formInline).then(() => {
          message($t("inventory.move.createSuccess"), { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 执行/取消 */
  function onAction(row: MoveItem, action: "execute" | "cancel") {
    const map = {
      execute: [
        executeMove,
        $t("inventory.move.executed"),
        $t("inventory.move.executeTip")
      ],
      cancel: [
        cancelMove,
        $t("inventory.move.cancelled"),
        $t("inventory.move.cancelTip")
      ]
    } as const;
    const [api, msg, tip] = map[action];
    ElMessageBox.confirm(tip as string, $t("inventory.move.tip"), {
      type: "warning"
    }).then(() => {
      (api as (id: number) => Promise<any>)(row.id).then(() => {
        message(msg as string, { type: "success" });
        onSearch();
      });
    });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    moveTypeOptions,
    docStatusOptions,
    onSearch,
    resetForm,
    openDialog,
    onAction,
    handleSizeChange,
    handleCurrentChange
  };
}
