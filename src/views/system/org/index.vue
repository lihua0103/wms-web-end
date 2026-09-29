<script setup lang="ts">
import { useOrg } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "~icons/ep/plus";

defineOptions({ name: "SystemOrg" });

const { loading, columns, dataList, onSearch, openDialog } = useOrg();
</script>

<template>
  <div class="main">
    <PureTableBar
      :title="$t('system.org.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog($t('system.org.addOrg'))"
        >
          {{ $t("system.org.addOrg") }}
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
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
          :adaptiveConfig="{ offsetBottom: 140 }"
        />
      </template>
    </PureTableBar>
  </div>
</template>
