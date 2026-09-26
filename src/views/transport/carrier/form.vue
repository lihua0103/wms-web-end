<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { CarrierItem } from "@/api/transport";

interface Props {
  formInline: Partial<CarrierItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [{ required: true, message: "请输入编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入承运商名称", trigger: "blur" }],
  carrierType: [{ required: true, message: "请选择类型", trigger: "change" }]
};

const typeOptions = [
  { value: "self", label: "自有车队" },
  { value: "third", label: "第三方物流" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="90px">
    <el-form-item label="编码" prop="code">
      <el-input v-model="newFormInline.code" placeholder="如 CAR006" :disabled="!!newFormInline.id" />
    </el-form-item>
    <el-form-item label="名称" prop="name">
      <el-input v-model="newFormInline.name" placeholder="承运商名称" />
    </el-form-item>
    <el-form-item label="类型" prop="carrierType">
      <el-select v-model="newFormInline.carrierType" style="width: 100%">
        <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="联系人">
      <el-input v-model="newFormInline.contact" placeholder="联系人" />
    </el-form-item>
    <el-form-item label="电话">
      <el-input v-model="newFormInline.phone" placeholder="电话" />
    </el-form-item>
    <el-form-item label="服务区域">
      <el-input v-model="newFormInline.serviceArea" placeholder="如 华东/华南" />
    </el-form-item>
    <el-form-item label="结算方式">
      <el-select v-model="newFormInline.settleType" style="width: 100%">
        <el-option label="月结" value="月结" />
        <el-option label="现结" value="现结" />
      </el-select>
    </el-form-item>
    <el-form-item label="状态">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">启用</el-radio>
        <el-radio :value="0">停用</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="备注">
      <el-input v-model="newFormInline.remark" type="textarea" placeholder="备注" />
    </el-form-item>
  </el-form>
</template>
