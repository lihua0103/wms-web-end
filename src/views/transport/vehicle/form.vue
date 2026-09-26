<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { VehicleItem } from "@/api/transport";

interface Props {
  formInline: Partial<VehicleItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
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
    <el-form-item label="车牌号" prop="vehicleNo">
      <el-input v-model="newFormInline.vehicleNo" placeholder="如 苏A12345" />
    </el-form-item>
    <el-form-item label="司机" prop="driverName">
      <el-input v-model="newFormInline.driverName" placeholder="司机姓名" />
    </el-form-item>
    <el-form-item label="电话">
      <el-input v-model="newFormInline.phone" placeholder="联系电话" />
    </el-form-item>
    <el-form-item label="车型">
      <el-select v-model="newFormInline.vehicleType" style="width: 100%">
        <el-option label="厢式" value="厢式" />
        <el-option label="平板" value="平板" />
        <el-option label="冷藏" value="冷藏" />
      </el-select>
    </el-form-item>
    <el-form-item label="载重(吨)">
      <el-input-number v-model="newFormInline.maxLoad" :min="1" :max="50" style="width: 100%" />
    </el-form-item>
    <el-form-item label="所属承运商">
      <el-select v-model="newFormInline.carrierName" style="width: 100%">
        <el-option v-for="c in carrierOptions" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="状态">
      <el-radio-group v-model="newFormInline.status">
        <el-radio value="空闲">空闲</el-radio>
        <el-radio value="在途">在途</el-radio>
        <el-radio value="维修">维修</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="备注">
      <el-input v-model="newFormInline.remark" type="textarea" placeholder="备注" />
    </el-form-item>
  </el-form>
</template>
