<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import { $t } from "@/plugins/i18n";
import type { ProcessOrderItem } from "@/api/operation";

interface Props {
  formInline: Partial<ProcessOrderItem> & { onlyOutput?: boolean };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  processType: [
    {
      required: true,
      message: $t("operation.process.selectType"),
      trigger: "change"
    }
  ],
  warehouseCode: [
    {
      required: true,
      message: $t("operation.process.selectWarehouse"),
      trigger: "change"
    }
  ],
  materialCode: [
    {
      required: true,
      message: $t("operation.process.inputMaterialCode"),
      trigger: "blur"
    }
  ],
  inputQty: [
    {
      required: true,
      message: $t("operation.process.inputQtyRequired"),
      trigger: "blur"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("operation.process.wh001") },
  { value: "WH002", label: $t("operation.process.wh002") },
  { value: "WH003", label: $t("operation.process.wh003") }
];

const processTypeOptions = [
  { value: "贴标", label: $t("operation.process.typeLabeling") },
  { value: "组套", label: $t("operation.process.typeKitting") },
  { value: "分装", label: $t("operation.process.typeRepacking") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="90px"
  >
    <template v-if="!newFormInline.onlyOutput">
      <el-form-item
        :label="$t('operation.process.processType')"
        prop="processType"
      >
        <el-select v-model="newFormInline.processType" style="width: 100%">
          <el-option
            v-for="t in processTypeOptions"
            :key="t.value"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('common.columns.warehouse')"
        prop="warehouseCode"
      >
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
        :label="$t('operation.process.materialCode')"
        prop="materialCode"
      >
        <el-input
          v-model="newFormInline.materialCode"
          :placeholder="$t('operation.process.materialCodePh')"
        />
      </el-form-item>
      <el-form-item
        :label="$t('operation.process.materialName')"
        prop="materialName"
      >
        <el-input
          v-model="newFormInline.materialName"
          :placeholder="$t('operation.process.materialName')"
        />
      </el-form-item>
      <el-form-item :label="$t('operation.process.inputQty')" prop="inputQty">
        <el-input-number
          v-model="newFormInline.inputQty"
          :min="1"
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
    </template>
    <template v-else>
      <el-form-item :label="$t('operation.process.inputQty')">
        <el-input :model-value="newFormInline.inputQty" disabled />
      </el-form-item>
      <el-form-item :label="$t('operation.process.outputQty')" prop="outputQty">
        <el-input-number
          v-model="newFormInline.outputQty"
          :min="0"
          style="width: 100%"
        />
      </el-form-item>
    </template>
  </el-form>
</template>
