<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { DictDataItem } from "@/api/system";

interface Props {
  formInline: Partial<DictDataItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  label: [{ required: true, message: "请输入数据标签", trigger: "blur" }],
  value: [{ required: true, message: "请输入数据键值", trigger: "blur" }]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="所属类型" prop="dictCode">
      <el-input v-model="newFormInline.dictCode" disabled />
    </el-form-item>
    <el-form-item label="数据标签" prop="label">
      <el-input
        v-model="newFormInline.label"
        placeholder="请输入数据标签（显示名）"
      />
    </el-form-item>
    <el-form-item label="数据键值" prop="value">
      <el-input
        v-model="newFormInline.value"
        placeholder="请输入数据键值（存储值）"
      />
    </el-form-item>
    <el-form-item label="排序" prop="sort">
      <el-input-number
        v-model="newFormInline.sort"
        :min="0"
        controls-position="right"
      />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">启用</el-radio>
        <el-radio :value="0">停用</el-radio>
      </el-radio-group>
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
