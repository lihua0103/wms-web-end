<script setup lang="ts">
import { useMenu } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import Plus from "~icons/ep/plus";

defineOptions({ name: "SystemMenu" });

const { loading, columns, dataList, onSearch, openDialog, handleDelete } =
  useMenu();
</script>

<template>
  <div class="main">
    <PureTableBar title="菜单管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('新增菜单')"
        >
          新增菜单
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          align-whole="center"
          row-key="id"
          show-overflow-tooltip
          default-expand-all
          :tree-props="{
            children: 'children',
            hasChildren: 'hasChildren',
            checkStrictly: false
          }"
          :data="dataList"
          :columns="dynamicColumns"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 120 }"
        >
          <template #operation="{ row }">
            <el-button
              v-if="row.menuType !== 'button'"
              link
              type="primary"
              :icon="useRenderIcon(Plus)"
              @click="openDialog('新增子菜单', undefined, row)"
            >
              新增子级
            </el-button>
            <el-button
              link
              type="primary"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('编辑菜单', row)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              :icon="useRenderIcon(Delete)"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>
