<script setup lang="ts">
import { ref } from "vue";
import {
  useNotice,
  noticeTypeOptions,
  noticeLevelOptions,
  readStatusOptions
} from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { dictTag, dictLabel } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import View from "~icons/ep/view";
import Check from "~icons/ep/check";
import Delete from "~icons/ep/delete";
import Bell from "~icons/ep/bell";

defineOptions({ name: "SystemNotice" });

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
  openDialog,
  openDetail,
  handleRead,
  handleDelete,
  handleSizeChange,
  handleCurrentChange
} = useNotice();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="标题" prop="keyword">
        <el-input
          v-model="form.keyword"
          placeholder="请输入消息标题"
          clearable
          style="width: 200px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="全部"
          clearable
          style="width: 130px"
        >
          <el-option
            v-for="d in noticeTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="form.status"
          placeholder="全部"
          clearable
          style="width: 130px"
        >
          <el-option
            v-for="d in readStatusOptions"
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

    <PureTableBar title="消息通知" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(Bell)"
          @click="openDialog('发布公告')"
        >
          发布公告
        </el-button>
      </template>
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
              查看
            </el-button>
            <el-button
              v-if="row.status === 0"
              link
              type="success"
              :icon="useRenderIcon(Check)"
              @click="handleRead(row)"
            >
              标记已读
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

    <!-- 消息详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="currentRow?.title || '消息详情'"
      size="460px"
    >
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item label="类型">
          <el-tag :type="dictTag(noticeTypeOptions, currentRow.type) as any">
            {{ dictLabel(noticeTypeOptions, currentRow.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="级别">
          <el-tag :type="dictTag(noticeLevelOptions, currentRow.level) as any">
            {{ dictLabel(noticeLevelOptions, currentRow.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="dictTag(readStatusOptions, currentRow.status) as any">
            {{ dictLabel(readStatusOptions, currentRow.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布人">{{
          currentRow.publisher
        }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{
          currentRow.createdAt
        }}</el-descriptions-item>
      </el-descriptions>
      <div class="mt-4">
        <div class="mb-2 font-bold">消息内容</div>
        <p class="leading-6 whitespace-pre-wrap text-gray-600">
          {{ currentRow?.content || "-" }}
        </p>
      </div>
      <template #footer>
        <el-button
          v-if="currentRow?.status === 0"
          type="primary"
          :icon="useRenderIcon(Check)"
          @click="currentRow && handleRead(currentRow)"
        >
          标记已读
        </el-button>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
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
