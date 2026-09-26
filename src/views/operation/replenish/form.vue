<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { ReplenishItem } from "@/api/operation";

interface Props {
  formInline: Partial<ReplenishItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [{ required: true, message: "请选择仓库", trigger: "change" }],
  fromLocation: [{ required: true, message: "请输入源库位", trigger: "blur" }],
  toLocation: [{ required: true, message: "请输入目标库位", trigger: "blur" }],
  materialCode: [{ required: true, message: "请输入物料编码", trigger: "blur" }],
  qty: [{ required: true, message: "请输入补货数量", trigger: "blur" }]
};

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="90px">
    <el-form-item label="仓库" prop="warehouseCode">
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="源库位" prop="fromLocation">
      <el-input v-model="newFormInline.fromLocation" placeholder="如 B-01-01" />
    </el-form-item>
    <el-form-item label="目标库位" prop="toLocation">
      <el-input v-model="newFormInline.toLocation" placeholder="如 C-01-02" />
    </el-form-item>
    <el-form-item label="物料编码" prop="materialCode">
      <el-input v-model="newFormInline.materialCode" placeholder="如 SKU00001" />
    </el-form-item>
    <el-form-item label="物料名称" prop="materialName">
      <el-input v-model="newFormInline.materialName" placeholder="物料名称" />
    </el-form-item>
    <el-form-item label="补货数量" prop="qty">
      <el-input-number v-model="newFormInline.qty" :min="1" style="width: 100%" />
    </el-form-item>
  </el-form>
</template>
