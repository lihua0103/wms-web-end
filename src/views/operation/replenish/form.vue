<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import { $t } from "@/plugins/i18n";
import type { ReplenishItem } from "@/api/operation";

interface Props {
  formInline: Partial<ReplenishItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [
    {
      required: true,
      message: $t("operation.replenish.selectWarehouse"),
      trigger: "change"
    }
  ],
  fromLocation: [
    {
      required: true,
      message: $t("operation.replenish.inputFromLocation"),
      trigger: "blur"
    }
  ],
  toLocation: [
    {
      required: true,
      message: $t("operation.replenish.inputToLocation"),
      trigger: "blur"
    }
  ],
  materialCode: [
    {
      required: true,
      message: $t("operation.replenish.inputMaterialCode"),
      trigger: "blur"
    }
  ],
  qty: [
    {
      required: true,
      message: $t("operation.replenish.inputQty"),
      trigger: "blur"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("operation.replenish.wh001") },
  { value: "WH002", label: $t("operation.replenish.wh002") },
  { value: "WH003", label: $t("operation.replenish.wh003") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="90px"
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
    <el-form-item
      :label="$t('operation.replenish.fromLocation')"
      prop="fromLocation"
    >
      <el-input
        v-model="newFormInline.fromLocation"
        :placeholder="$t('operation.replenish.fromLocationPh')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('operation.replenish.toLocation')"
      prop="toLocation"
    >
      <el-input
        v-model="newFormInline.toLocation"
        :placeholder="$t('operation.replenish.toLocationPh')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('operation.replenish.materialCode')"
      prop="materialCode"
    >
      <el-input
        v-model="newFormInline.materialCode"
        :placeholder="$t('operation.replenish.materialCodePh')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('operation.replenish.materialName')"
      prop="materialName"
    >
      <el-input
        v-model="newFormInline.materialName"
        :placeholder="$t('operation.replenish.materialName')"
      />
    </el-form-item>
    <el-form-item :label="$t('operation.replenish.qty')" prop="qty">
      <el-input-number
        v-model="newFormInline.qty"
        :min="1"
        style="width: 100%"
      />
    </el-form-item>
  </el-form>
</template>
