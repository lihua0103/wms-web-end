<script setup lang="ts">
import { ref } from "vue";
import { useLog, logStatusOptions } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { dictTag, dictLabel } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import View from "~icons/ep/view";

defineOptions({ name: "SystemLog" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  detailVisible,
  currentRow,
  onSearch,
  resetForm,
  openDetail,
  handleSizeChange,
  handleCurrentChange
} = useLog();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="关键字" prop="keyword">
        <el-input
          v-model="form.keyword"
          placeholder="操作人 / 模块 / 操作"
          clearable
          style="width: 200px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="执行结果" prop="status">
        <el-select
          v-model="form.status"
          placeholder="全部"
          clearable
          style="width: 140px"
        >
          <el-option
            v-for="d in logStatusOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(SearchIcon)"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button
          :icon="useRenderIcon(RefreshIcon)"
          @click="resetForm(searchFormRef)"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="操作日志" :columns="columns" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          align-whole="center"
          row-key="id"
          show-overflow-tooltip
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 120 }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              link
              type="primary"
              :icon="useRenderIcon(View)"
              @click="openDetail(row)"
            >
              详情
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 日志详情 -->
    <el-drawer v-model="detailVisible" title="日志详情" size="420px">
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item label="操作人">{{
          currentRow.username
        }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{
          currentRow.module
        }}</el-descriptions-item>
        <el-descriptions-item label="操作">{{
          currentRow.action
        }}</el-descriptions-item>
        <el-descriptions-item label="IP 地址">{{
          currentRow.ip
        }}</el-descriptions-item>
        <el-descriptions-item label="执行结果">
          <el-tag :type="dictTag(logStatusOptions, currentRow.status) as any">
            {{ dictLabel(logStatusOptions, currentRow.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时"
          >{{ currentRow.duration }} ms</el-descriptions-item
        >
        <el-descriptions-item label="操作时间">{{
          currentRow.createdAt
        }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
