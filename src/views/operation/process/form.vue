<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { ProcessOrderItem } from "@/api/operation";

interface Props {
  formInline: Partial<ProcessOrderItem> & { onlyOutput?: boolean };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  processType: [{ required: true, message: "请选择加工类型", trigger: "change" }],
  warehouseCode: [{ required: true, message: "请选择仓库", trigger: "change" }],
  materialCode: [{ required: true, message: "请输入物料编码", trigger: "blur" }],
  inputQty: [{ required: true, message: "请输入投入数量", trigger: "blur" }]
};

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];

const processTypeOptions = [
  { value: "贴标", label: "贴标" },
  { value: "组套", label: "组套" },
  { value: "分装", label: "分装" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="90px">
    <template v-if="!newFormInline.onlyOutput">
      <el-form-item label="加工类型" prop="processType">
        <el-select v-model="newFormInline.processType" style="width: 100%">
          <el-option v-for="t in processTypeOptions" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseCode">
        <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
          <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="物料编码" prop="materialCode">
        <el-input v-model="newFormInline.materialCode" placeholder="如 SKU00001" />
      </el-form-item>
      <el-form-item label="物料名称" prop="materialName">
        <el-input v-model="newFormInline.materialName" placeholder="物料名称" />
      </el-form-item>
      <el-form-item label="投入数量" prop="inputQty">
        <el-input-number v-model="newFormInline.inputQty" :min="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="newFormInline.remark" type="textarea" placeholder="备注" />
      </el-form-item>
    </template>
    <template v-else>
      <el-form-item label="投入数量">
        <el-input :model-value="newFormInline.inputQty" disabled />
      </el-form-item>
      <el-form-item label="产出数量" prop="outputQty">
        <el-input-number v-model="newFormInline.outputQty" :min="0" style="width: 100%" />
      </el-form-item>
    </template>
  </el-form>
</template>
