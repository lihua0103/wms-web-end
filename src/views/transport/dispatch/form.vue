<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";

interface Props {
  formInline: {
    id: number;
    code: string;
    carrierName: string;
    vehicleNo: string;
    driverName: string;
  };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  carrierName: [{ required: true, message: "请选择承运商", trigger: "change" }],
  vehicleNo: [{ required: true, message: "请输入车牌号", trigger: "blur" }],
  driverName: [{ required: true, message: "请输入司机姓名", trigger: "blur" }]
};

const carrierOptions = [
  { value: "顺丰速运", label: "顺丰速运" },
  { value: "京东物流", label: "京东物流" },
  { value: "德邦快递", label: "德邦快递" },
  { value: "自有车队", label: "自有车队" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="90px">
    <el-form-item label="配送单号">
      <el-input :model-value="newFormInline.code" disabled />
    </el-form-item>
    <el-form-item label="承运商" prop="carrierName">
      <el-select v-model="newFormInline.carrierName" style="width: 100%">
        <el-option v-for="c in carrierOptions" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="车牌号" prop="vehicleNo">
      <el-input v-model="newFormInline.vehicleNo" placeholder="如 苏A12345" />
    </el-form-item>
    <el-form-item label="司机" prop="driverName">
      <el-input v-model="newFormInline.driverName" placeholder="司机姓名" />
    </el-form-item>
  </el-form>
</template>
