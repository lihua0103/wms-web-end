<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { AdjustmentItem } from "@/api/inventory";
import { adjustTypeOptions } from "@/constants/wms";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<AdjustmentItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [
    {
      required: true,
      message: $t("inventory.adjustment.selectWarehouse"),
      trigger: "change"
    }
  ],
  locationCode: [
    {
      required: true,
      message: $t("inventory.adjustment.locationRequired"),
      trigger: "blur"
    }
  ],
  materialCode: [
    {
      required: true,
      message: $t("inventory.adjustment.materialCodeRequired"),
      trigger: "blur"
    }
  ],
  adjustType: [
    {
      required: true,
      message: $t("inventory.adjustment.selectAdjustType"),
      trigger: "change"
    }
  ],
  reason: [
    {
      required: true,
      message: $t("inventory.adjustment.reasonRequired"),
      trigger: "blur"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("inventory.adjustment.whShanghai") },
  { value: "WH002", label: $t("inventory.adjustment.whGuangzhou") },
  { value: "WH003", label: $t("inventory.adjustment.whChengdu") }
];

const qtyAfter = computed(
  () =>
    (Number(newFormInline.qtyBefore) || 0) +
    (Number(newFormInline.qtyChange) || 0)
);
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
    <el-form-item :label="$t('common.columns.location')" prop="locationCode">
      <el-input
        v-model="newFormInline.locationCode"
        :placeholder="$t('inventory.adjustment.locationExample')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('inventory.adjustment.materialCode')"
      prop="materialCode"
    >
      <el-input
        v-model="newFormInline.materialCode"
        :placeholder="$t('inventory.adjustment.materialCodeExample')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('inventory.adjustment.materialName')"
      prop="materialName"
    >
      <el-input v-model="newFormInline.materialName" />
    </el-form-item>
    <el-form-item :label="$t('inventory.adjustment.batch')" prop="batchNo">
      <el-input v-model="newFormInline.batchNo" />
    </el-form-item>
    <el-form-item
      :label="$t('inventory.adjustment.adjustType')"
      prop="adjustType"
    >
      <el-select v-model="newFormInline.adjustType" style="width: 100%">
        <el-option
          v-for="d in adjustTypeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      :label="$t('inventory.adjustment.beforeQty')"
      prop="qtyBefore"
    >
      <el-input-number
        v-model="newFormInline.qtyBefore"
        :min="0"
        controls-position="right"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item
      :label="$t('inventory.adjustment.changeQty')"
      prop="qtyChange"
    >
      <el-input-number
        v-model="newFormInline.qtyChange"
        controls-position="right"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('inventory.adjustment.afterQty')">
      <span class="font-semibold">{{ qtyAfter }}</span>
    </el-form-item>
    <el-form-item :label="$t('inventory.adjustment.reason')" prop="reason">
      <el-input
        v-model="newFormInline.reason"
        type="textarea"
        :placeholder="$t('inventory.adjustment.reasonPh')"
      />
    </el-form-item>
  </el-form>
</template>
