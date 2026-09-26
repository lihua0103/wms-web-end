<script setup lang="ts">
import { ref } from "vue";
import { useDict } from "./utils/hook";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import AddFill from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";

defineOptions({ name: "SystemDict" });

const typeSearchFormRef = ref();

const {
  typeForm,
  typeLoading,
  typeList,
  typeColumns,
  typePagination,
  selectedType,
  onTypeSearch,
  resetTypeForm,
  handleTypeSizeChange,
  handleTypeCurrentChange,
  openTypeDialog,
  handleTypeDelete,
  handleTypeClick,
  dataLoading,
  dataList,
  dataColumns,
  openDataDialog,
  handleDataDelete
} = useDict();
</script>

<template>
  <div class="main">
    <el-row :gutter="16">
      <!-- 左侧：字典类型 -->
      <el-col :span="10">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold">字典类型</span>
              <el-button
                type="primary"
                size="small"
                :icon="useRenderIcon(AddFill)"
                @click="openTypeDialog('新增字典类型')"
              >
                新增类型
              </el-button>
            </div>
          </template>
          <el-form
            ref="typeSearchFormRef"
            :inline="true"
            :model="typeForm"
            class="mb-2"
          >
            <el-form-item prop="keyword" class="mb-2!">
              <el-input
                v-model="typeForm.keyword"
                placeholder="字典名称 / 编码"
                clearable
                style="width: 180px"
                @keyup.enter="onTypeSearch"
              />
            </el-form-item>
            <el-form-item class="mb-2!">
              <el-button
                type="primary"
                :icon="useRenderIcon(SearchIcon)"
                @click="onTypeSearch"
              >
                搜索
              </el-button>
              <el-button
                :icon="useRenderIcon(RefreshIcon)"
                @click="resetTypeForm(typeSearchFormRef)"
              >
                重置
              </el-button>
            </el-form-item>
          </el-form>
          <pure-table
            border
            align-whole="center"
            row-key="id"
            show-overflow-tooltip
            highlight-current-row
            adaptive
            :adaptiveConfig="{ offsetBottom: 180 }"
            :data="typeList"
            :columns="typeColumns"
            :pagination="typePagination"
            :loading="typeLoading"
            size="small"
            @page-size-change="handleTypeSizeChange"
            @page-current-change="handleTypeCurrentChange"
            @row-click="handleTypeClick"
          >
            <template #operation="{ row }">
              <el-button
                link
                type="primary"
                :icon="useRenderIcon(EditPen)"
                @click.stop="openTypeDialog('编辑字典类型', row)"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                :icon="useRenderIcon(Delete)"
                @click.stop="handleTypeDelete(row)"
              >
                删除
              </el-button>
            </template>
          </pure-table>
        </el-card>
      </el-col>

      <!-- 右侧：字典数据 -->
      <el-col :span="14">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold">
                字典数据
                <el-tag
                  v-if="selectedType"
                  class="ml-2"
                  type="primary"
                  effect="plain"
                >
                  {{ selectedType.name }}（{{ selectedType.code }}）
                </el-tag>
              </span>
              <el-button
                type="primary"
                size="small"
                :icon="useRenderIcon(AddFill)"
                :disabled="!selectedType"
                @click="openDataDialog('新增字典数据')"
              >
                新增数据
              </el-button>
            </div>
          </template>
          <el-empty
            v-if="!selectedType && !dataLoading"
            description="请在左侧选择字典类型"
          />
          <pure-table
            v-else
            border
            align-whole="center"
            row-key="id"
            show-overflow-tooltip
            adaptive
            :adaptiveConfig="{ offsetBottom: 180 }"
            :data="dataList"
            :columns="dataColumns"
            :loading="dataLoading"
            size="small"
          >
            <template #operation="{ row }">
              <el-button
                link
                type="primary"
                :icon="useRenderIcon(EditPen)"
                @click="openDataDialog('编辑字典数据', row)"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                :icon="useRenderIcon(Delete)"
                @click="handleDataDelete(row)"
              >
                删除
              </el-button>
            </template>
          </pure-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
