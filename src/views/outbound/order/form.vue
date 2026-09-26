<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { OutboundOrderItem } from "@/api/outbound";
import { outboundTypeOptions, priorityOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<OutboundOrderItem>;
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
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="仓库" prop="warehouseCode">
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="客户" prop="customerName">
      <el-input v-model="newFormInline.customerName" placeholder="客户名称" />
    </el-form-item>
    <el-form-item label="出库类型" prop="type">
      <el-select v-model="newFormInline.type" style="width: 100%">
        <el-option v-for="d in outboundTypeOptions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="优先级" prop="priority">
      <el-select v-model="newFormInline.priority" style="width: 100%">
        <el-option v-for="d in priorityOptions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
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
    <el-form-item label="交货日期">
      <el-date-picker v-model="newFormInline.deliveryDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
    </el-form-item>
    <el-form-item label="备注">
      <el-input v-model="newFormInline.remark" type="textarea" placeholder="备注" />
    </el-form-item>
  </el-form>
</template>
