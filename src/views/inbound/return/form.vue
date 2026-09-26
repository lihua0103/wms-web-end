<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { ReturnInboundItem } from "@/api/inbound";

interface Props {
  formInline: Partial<ReturnInboundItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [{ required: true, message: "请选择仓库", trigger: "change" }],
  customerName: [{ required: true, message: "请输入客户名称", trigger: "blur" }],
  materialCode: [{ required: true, message: "请输入物料编码", trigger: "blur" }],
  qty: [{ required: true, message: "请输入数量", trigger: "blur" }]
};

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];

const ownerOptions = [
  { value: "货主A 华东电子", label: "货主A 华东电子" },
  { value: "货主B 精工机械", label: "货主B 精工机械" },
  { value: "货主C 日化用品", label: "货主C 日化用品" },
  { value: "自营", label: "自营" }
];

const reasonOptions = ["质量问题", "错发", "客户拒收", "包装破损", "临期退货"];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="仓库" prop="warehouseCode">
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="货主">
      <el-select v-model="newFormInline.ownerName" style="width: 100%">
        <el-option v-for="o in ownerOptions" :key="o.value" :label="o.label" :value="o.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="客户" prop="customerName">
      <el-input v-model="newFormInline.customerName" placeholder="客户名称" />
    </el-form-item>
    <el-form-item label="物料编码" prop="materialCode">
      <el-input v-model="newFormInline.materialCode" placeholder="如 SKU00001" />
    </el-form-item>
    <el-form-item label="物料名称">
      <el-input v-model="newFormInline.materialName" placeholder="物料名称" />
    </el-form-item>
    <el-form-item label="数量" prop="qty">
      <el-input-number v-model="newFormInline.qty" :min="1" style="width: 100%" />
    </el-form-item>
    <el-form-item label="退货原因">
      <el-select v-model="newFormInline.reason" style="width: 100%">
        <el-option v-for="r in reasonOptions" :key="r" :label="r" :value="r" />
      </el-select>
    </el-form-item>
    <el-form-item label="备注">
      <el-input v-model="newFormInline.remark" type="textarea" placeholder="备注" />
    </el-form-item>
  </el-form>
</template>
