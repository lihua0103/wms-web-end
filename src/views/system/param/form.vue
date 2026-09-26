<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { ParamItem } from "@/api/system";

interface Props {
  formInline: Partial<ParamItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  name: [{ required: true, message: "请输入参数名称", trigger: "blur" }],
  key: [{ required: true, message: "请输入参数键", trigger: "blur" }],
  value: [{ required: true, message: "请输入参数值", trigger: "blur" }]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="参数名称" prop="name">
      <el-input v-model="newFormInline.name" placeholder="请输入参数名称" />
    </el-form-item>
    <el-form-item label="参数键" prop="key">
      <el-input
        v-model="newFormInline.key"
        placeholder="请输入参数键，如 outbound.batch.strategy"
        :disabled="newFormInline.builtIn === 1"
      />
      <span v-if="newFormInline.builtIn === 1" class="text-xs text-gray-400">
        内置参数，参数键不可修改
      </span>
    </el-form-item>
    <el-form-item label="参数值" prop="value">
      <el-input v-model="newFormInline.value" placeholder="请输入参数值" />
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
