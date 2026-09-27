<script setup lang="ts">
import { reactive, ref } from "vue";
import { $t } from "@/plugins/i18n";
import type { FormRules } from "element-plus";

interface Props {
  formInline: {
    id: number;
    code: string;
    qty: number;
    checkedQty: number;
    weight?: number;
  };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  checkedQty: [
    {
      required: true,
      message: $t("outbound.packing.checkedQtyRequired"),
      trigger: "blur"
    }
  ]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('outbound.packing.code')">
      <el-input :model-value="newFormInline.code" disabled />
    </el-form-item>
    <el-form-item :label="$t('outbound.packing.expectedQty')">
      <el-input :model-value="newFormInline.qty" disabled />
    </el-form-item>
    <el-form-item :label="$t('outbound.packing.checkedQty')" prop="checkedQty">
      <el-input-number
        v-model="newFormInline.checkedQty"
        :min="0"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('outbound.packing.weight')">
      <el-input-number
        v-model="newFormInline.weight"
        :min="0"
        :precision="2"
        style="width: 100%"
      />
    </el-form-item>
  </el-form>
</template>
