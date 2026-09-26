<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { AsnItem } from "@/api/inbound";
import { inboundTypeOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<AsnItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [{ required: true, message: "请选择仓库", trigger: "change" }],
  supplierName: [{ required: true, message: "请输入供应商", trigger: "blur" }],
  expectedArrival: [{ required: true, message: "请选择预计到货时间", trigger: "change" }]
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
    <el-form-item label="供应商" prop="supplierName">
      <el-input v-model="newFormInline.supplierName" placeholder="供应商名称" />
    </el-form-item>
    <el-form-item label="入库类型" prop="type">
      <el-select v-model="newFormInline.type" style="width: 100%">
        <el-option v-for="d in inboundTypeOptions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="预计到货" prop="expectedArrival">
      <el-date-picker
        v-model="newFormInline.expectedArrival"
        type="datetime"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item label="备注">
      <el-input v-model="newFormInline.remark" type="textarea" placeholder="备注" />
    </el-form-item>
  </el-form>
</template>
