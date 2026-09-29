<script setup lang="ts">
import { ref } from "vue";
import { useRole } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "~icons/ep/plus";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "SystemRole" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  authVisible,
  authLoading,
  saveLoading,
  currentRole,
  menuTreeData,
  menuTreeRef,
  onSearch,
  resetForm,
  openDialog,
  saveAuth,
  handleSizeChange,
  handleCurrentChange
} = useRole();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="$t('system.role.keyword')" prop="keyword">
        <el-input
          v-model="form.keyword"
          :placeholder="$t('system.role.keywordPh')"
          clearable
          style="width: 200px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('system.role.all')"
          clearable
          style="width: 140px"
        >
          <el-option :label="$t('common.buttons.enabled')" :value="1" />
          <el-option :label="$t('common.buttons.disabled')" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(SearchIcon)"
          @click="onSearch"
        >
          {{ $t("common.buttons.search") }}
        </el-button>
        <el-button
          :icon="useRenderIcon(RefreshIcon)"
          @click="resetForm(searchFormRef)"
        >
          {{ $t("common.buttons.reset") }}
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar
      :title="$t('system.role.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog($t('system.role.addRole'))"
        >
          {{ $t("system.role.addRole") }}
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          row-key="id"
          show-overflow-tooltip
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 140 }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        />
      </template>
    </PureTableBar>

    <!-- 菜单授权 -->
    <el-dialog
      v-model="authVisible"
      :title="$t('system.role.authTitle', { name: currentRole?.name || '' })"
      width="480px"
      destroy-on-close
    >
      <el-tree
        ref="menuTreeRef"
        v-loading="authLoading"
        :data="menuTreeData"
        node-key="id"
        show-checkbox
        default-expand-all
        :props="{ label: 'name', children: 'children' }"
      />
      <template #footer>
        <el-button @click="authVisible = false">
          {{ $t("common.buttons.cancel") }}
        </el-button>
        <el-button type="primary" :loading="saveLoading" @click="saveAuth">
          {{ $t("common.buttons.save") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
