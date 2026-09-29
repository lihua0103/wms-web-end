<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { SerialItem } from "@/api/inventory";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<SerialItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  serialNo: [
    {
      required: true,
      message: $t("inventory.serial.serialNoRequired"),
      trigger: "blur"
    }
  ],
  materialCode: [
    {
      required: true,
      message: $t("inventory.serial.materialCodeRequired"),
      trigger: "blur"
    }
  ],
  materialName: [
    {
      required: true,
      message: $t("inventory.serial.materialNameRequired"),
      trigger: "blur"
    }
  ],
  warehouseCode: [
    {
      required: true,
      message: $t("inventory.serial.selectWarehouse"),
      trigger: "change"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("inventory.serial.whShanghai") },
  { value: "WH002", label: $t("inventory.serial.whGuangzhou") },
  { value: "WH003", label: $t("inventory.serial.whChengdu") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('inventory.serial.serialNo')" prop="serialNo">
      <el-input
        v-model="newFormInline.serialNo"
        :placeholder="$t('inventory.serial.serialNoExample')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('inventory.serial.materialCode')"
      prop="materialCode"
    >
      <el-input
        v-model="newFormInline.materialCode"
        :placeholder="$t('inventory.serial.materialCodeExample')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('inventory.serial.materialName')"
      prop="materialName"
    >
      <el-input v-model="newFormInline.materialName" />
    </el-form-item>
    <el-form-item :label="$t('inventory.serial.batch')" prop="batchNo">
      <el-input v-model="newFormInline.batchNo" />
    </el-form-item>
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
      <el-input v-model="newFormInline.locationCode" />
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
