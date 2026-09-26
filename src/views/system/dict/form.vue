<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { DictTypeItem } from "@/api/system";

interface Props {
  formInline: Partial<DictTypeItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  name: [{ required: true, message: "请输入字典名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入字典编码", trigger: "blur" }]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="字典名称" prop="name">
      <el-input v-model="newFormInline.name" placeholder="请输入字典名称" />
    </el-form-item>
    <el-form-item label="字典编码" prop="code">
      <el-input
        v-model="newFormInline.code"
        placeholder="请输入字典编码（英文标识）"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="newFormInline.remark"
        type="textarea"
        placeholder="备注"
      />
    </el-form-item>
  </el-form>
</template>
