<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";

interface Props {
  formInline: { warehouseCode: string; carrierName: string };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [{ required: true, message: "请选择仓库", trigger: "change" }]
};

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];

const carrierOptions = [
  { value: "顺丰速运", label: "顺丰速运" },
  { value: "京东物流", label: "京东物流" },
  { value: "德邦快递", label: "德邦快递" },
  { value: "自有车队", label: "自有车队" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="仓库" prop="warehouseCode">
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="承运商">
      <el-select v-model="newFormInline.carrierName" placeholder="按承运商合波（可空）" clearable style="width: 100%">
        <el-option v-for="c in carrierOptions" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
    </el-form-item>
  </el-form>
</template>
