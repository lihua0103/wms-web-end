<script setup lang="ts">
import { reactive, ref } from "vue";
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
  checkedQty: [{ required: true, message: "请输入复核数量", trigger: "blur" }]
};
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="复核单号">
      <el-input :model-value="newFormInline.code" disabled />
    </el-form-item>
    <el-form-item label="应复核数">
      <el-input :model-value="newFormInline.qty" disabled />
    </el-form-item>
    <el-form-item label="复核数量" prop="checkedQty">
      <el-input-number v-model="newFormInline.checkedQty" :min="0" style="width: 100%" />
    </el-form-item>
    <el-form-item label="重量(kg)">
      <el-input-number v-model="newFormInline.weight" :min="0" :precision="2" style="width: 100%" />
    </el-form-item>
  </el-form>
</template>
