<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { RoleItem } from "@/api/system";

interface Props {
  formInline: Partial<RoleItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="角色编码" prop="code">
      <el-input
        v-model="newFormInline.code"
        placeholder="请输入角色编码（英文标识）"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item label="角色名称" prop="name">
      <el-input v-model="newFormInline.name" placeholder="请输入角色名称" />
    </el-form-item>
    <el-form-item label="描述" prop="description">
      <el-input
        v-model="newFormInline.description"
        type="textarea"
        placeholder="请输入角色描述"
      />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">启用</el-radio>
        <el-radio :value="0">停用</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>
