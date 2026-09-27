<script setup lang="ts">
import { ref } from "vue";
import { useVehicle } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import AddFill from "~icons/ep/plus";

defineOptions({ name: "TransportVehicle" });

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
  handleSizeChange,
  handleCurrentChange
} = useVehicle();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item
        :label="$t('transport.vehicle.licensePlate')"
        prop="vehicleNo"
      >
        <el-input
          v-model="form.vehicleNo"
          :placeholder="$t('transport.vehicle.licensePlate')"
          clearable
          style="width: 140px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('transport.vehicle.driver')" prop="driverName">
        <el-input
          v-model="form.driverName"
          :placeholder="$t('transport.vehicle.driverPh')"
          clearable
          style="width: 140px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('transport.vehicle.all')"
          clearable
          style="width: 120px"
        >
          <el-option :label="$t('transport.vehicle.statusIdle')" value="空闲" />
          <el-option
            :label="$t('transport.vehicle.statusOnRoute')"
            value="在途"
          />
          <el-option
            :label="$t('transport.vehicle.statusRepair')"
            value="维修"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(SearchIcon)"
          @click="onSearch"
          >{{ $t("common.buttons.search") }}</el-button
        >
        <el-button
          :icon="useRenderIcon(RefreshIcon)"
          @click="resetForm(searchFormRef)"
          >{{ $t("common.buttons.reset") }}</el-button
        >
      </el-form-item>
    </el-form>

    <PureTableBar
      :title="$t('transport.vehicle.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog($t('transport.vehicle.add'))"
        >
          {{ $t("transport.vehicle.add") }}
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
        />
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
