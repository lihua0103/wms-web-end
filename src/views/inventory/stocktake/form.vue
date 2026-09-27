<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { StocktakeItem } from "@/api/inventory";
import { stocktakeModeOptions } from "@/constants/wms";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<StocktakeItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [
    {
      required: true,
      message: $t("inventory.stocktake.selectWarehouse"),
      trigger: "change"
    }
  ],
  mode: [
    {
      required: true,
      message: $t("inventory.stocktake.selectMode"),
      trigger: "change"
    }
  ],
  planDate: [
    {
      required: true,
      message: $t("inventory.stocktake.selectPlanDate"),
      trigger: "change"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("inventory.stocktake.whShanghai") },
  { value: "WH002", label: $t("inventory.stocktake.whGuangzhou") },
  { value: "WH003", label: $t("inventory.stocktake.whChengdu") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('common.columns.warehouse')" prop="warehouseCode">
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option
          v-for="w in warehouseOptions"
          :key="w.value"
          :label="w.label"
          :value="w.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('inventory.stocktake.mode')" prop="mode">
      <el-select v-model="newFormInline.mode" style="width: 100%">
        <el-option
          v-for="d in stocktakeModeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('inventory.stocktake.planDate')" prop="planDate">
      <el-date-picker
        v-model="newFormInline.planDate"
        type="date"
        value-format="YYYY-MM-DD"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.remark')" prop="remark">
      <el-input
        v-model="newFormInline.remark"
        type="textarea"
        :placeholder="$t('common.columns.remark')"
      />
    </el-form-item>
  </el-form>
</template>
