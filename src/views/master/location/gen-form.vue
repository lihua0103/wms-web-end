<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";

interface Props {
  formInline: {
    warehouseCode: string;
    zoneCode: string;
    prefix: string;
    row: number;
    col: number;
    floor: number;
  };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [{ required: true, message: "请选择仓库", trigger: "change" }],
  zoneCode: [{ required: true, message: "请输入库区编码", trigger: "blur" }],
  prefix: [{ required: true, message: "请输入编码前缀", trigger: "blur" }]
};

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="仓库" prop="warehouseCode">
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="库区编码" prop="zoneCode">
      <el-input v-model="newFormInline.zoneCode" placeholder="如 1Z01" />
    </el-form-item>
    <el-form-item label="编码前缀" prop="prefix">
      <el-input v-model="newFormInline.prefix" placeholder="生成编码的前缀，如 1Z01" />
    </el-form-item>
    <el-form-item label="排数">
      <el-input-number v-model="newFormInline.row" :min="1" :max="50" style="width: 100%" />
    </el-form-item>
    <el-form-item label="列数">
      <el-input-number v-model="newFormInline.col" :min="1" :max="50" style="width: 100%" />
    </el-form-item>
    <el-form-item label="层数">
      <el-input-number v-model="newFormInline.floor" :min="1" :max="10" style="width: 100%" />
    </el-form-item>
  </el-form>
</template>
