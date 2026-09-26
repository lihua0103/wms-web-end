<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";

interface Props {
  formInline: { id: number; taskNo: string; assignee: string };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  assignee: [{ required: true, message: "请选择执行人", trigger: "change" }]
};

const userOptions = [
  { value: "user002", label: "user002 张伟" },
  { value: "user003", label: "user003 王芳" },
  { value: "user004", label: "user004 李娜" },
  { value: "user005", label: "user005 刘洋" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="80px">
    <el-form-item label="任务号">
      <el-input :model-value="newFormInline.taskNo" disabled />
    </el-form-item>
    <el-form-item label="执行人" prop="assignee">
      <el-select v-model="newFormInline.assignee" placeholder="请选择执行人" style="width: 100%">
        <el-option v-for="u in userOptions" :key="u.value" :label="u.label" :value="u.value" />
      </el-select>
    </el-form-item>
  </el-form>
</template>
