<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";

interface Props {
  formInline: {
    id: number;
    code: string;
    materialName: string;
    receivedQty: number;
    qualifiedQty: number;
    rejectedQty: number;
  };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  receivedQty: [{ required: true, message: "请输入实收数量", trigger: "blur" }]
};
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="收货单号">
      <el-input :model-value="newFormInline.code" disabled />
    </el-form-item>
    <el-form-item label="物料名称">
      <el-input :model-value="newFormInline.materialName" disabled />
    </el-form-item>
    <el-form-item label="实收数量" prop="receivedQty">
      <el-input-number v-model="newFormInline.receivedQty" :min="0" style="width: 100%" />
    </el-form-item>
    <el-form-item label="合格数量" prop="qualifiedQty">
      <el-input-number v-model="newFormInline.qualifiedQty" :min="0" style="width: 100%" />
    </el-form-item>
    <el-form-item label="不合格数量" prop="rejectedQty">
      <el-input-number v-model="newFormInline.rejectedQty" :min="0" style="width: 100%" />
    </el-form-item>
  </el-form>
</template>
