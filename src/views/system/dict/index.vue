<script setup lang="ts">
import { ref } from "vue";
import { useDict } from "./utils/hook";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import AddFill from "~icons/ep/plus";

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
  handleTypeClick,
  dataLoading,
  dataList,
  dataColumns,
  openDataDialog
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
              <span class="font-bold">{{ $t("system.dict.typeTitle") }}</span>
              <el-button
                type="primary"
                size="small"
                :icon="useRenderIcon(AddFill)"
                @click="openTypeDialog($t('system.dict.addTypeTitle'))"
              >
                {{ $t("system.dict.addType") }}
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
                :placeholder="$t('system.dict.keywordPh')"
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
                {{ $t("common.buttons.search") }}
              </el-button>
              <el-button
                :icon="useRenderIcon(RefreshIcon)"
                @click="resetTypeForm(typeSearchFormRef)"
              >
                {{ $t("common.buttons.reset") }}
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
          />
        </el-card>
      </el-col>

      <!-- 右侧：字典数据 -->
      <el-col :span="14">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold">
                {{ $t("system.dict.dataTitle") }}
                <el-tag
                  v-if="selectedType"
                  class="ml-2"
                  type="primary"
                  effect="plain"
                >
                  {{
                    $t("system.dict.selectedTag", {
                      name: selectedType.name,
                      code: selectedType.code
                    })
                  }}
                </el-tag>
              </span>
              <el-button
                type="primary"
                size="small"
                :icon="useRenderIcon(AddFill)"
                :disabled="!selectedType"
                @click="openDataDialog($t('system.dict.addDataTitle'))"
              >
                {{ $t("system.dict.addData") }}
              </el-button>
            </div>
          </template>
          <el-empty
            v-if="!selectedType && !dataLoading"
            :description="$t('system.dict.selectTypeTip')"
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
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
