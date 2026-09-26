<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { CustomerItem } from "@/api/master";

interface Props {
  formInline: Partial<CustomerItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [{ required: true, message: "请输入客户编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入客户名称", trigger: "blur" }]
};
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="客户编码" prop="code">
      <el-input v-model="newFormInline.code" :disabled="!!newFormInline.id" />
    </el-form-item>
    <el-form-item label="客户名称" prop="name">
      <el-input v-model="newFormInline.name" />
    </el-form-item>
    <el-form-item label="联系人">
      <el-input v-model="newFormInline.contact" />
    </el-form-item>
    <el-form-item label="电话">
      <el-input v-model="newFormInline.phone" />
    </el-form-item>
    <el-form-item label="地址">
      <el-input v-model="newFormInline.address" />
    </el-form-item>
    <el-form-item label="状态">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">启用</el-radio>
        <el-radio :value="0">停用</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="备注">
      <el-input v-model="newFormInline.remark" type="textarea" />
    </el-form-item>
  </el-form>
</template>
