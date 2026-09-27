<script setup lang="ts">
import { useMenu } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "~icons/ep/plus";

defineOptions({ name: "SystemMenu" });

const { loading, columns, dataList, onSearch, openDialog } = useMenu();
</script>

<template>
  <div class="main">
    <PureTableBar
      :title="$t('system.menu.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog($t('system.menu.addMenu'))"
        >
          {{ $t("system.menu.addMenu") }}
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
        />
      </template>
    </PureTableBar>
  </div>
</template>
