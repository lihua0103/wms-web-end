<script setup lang="ts">
import { ref } from "vue";
import { useBillingRule } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { feeTypeOptions, userStatusOptions } from "@/constants/wms";
import AddFill from "~icons/ep/plus";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";

defineOptions({ name: "BillingRule" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleSizeChange,
  handleCurrentChange
} = useBillingRule();

const ownerOptions = [
  { value: "货主A 华东电子", label: "货主A 华东电子" },
  { value: "货主B 精工机械", label: "货主B 精工机械" },
  { value: "货主C 日化用品", label: "货主C 日化用品" },
  { value: "自营", label: "自营" }
];
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="编码" prop="code">
        <el-input
          v-model="form.code"
          placeholder="规则编码"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="货主" prop="ownerName">
        <el-select v-model="form.ownerName" placeholder="全部" clearable style="width: 170px">
          <el-option v-for="o in ownerOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="费用类型" prop="feeType">
        <el-select v-model="form.feeType" placeholder="全部" clearable style="width: 130px">
          <el-option v-for="d in feeTypeOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="全部" clearable style="width: 110px">
          <el-option v-for="d in userStatusOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(SearchIcon)" @click="onSearch">
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchFormRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="计费规则" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('新增计费规则')"
        >
          新增规则
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
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('编辑计费规则', row)"
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

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
