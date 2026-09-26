<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { OrgItem } from "@/api/system";
import { orgTypeOptions } from "./utils/hook";

interface Props {
  formInline: Partial<OrgItem>;
  /** 上级组织下拉选项（由 hook 拍平后传入） */
  parentOptions: { id: number; label: string }[];
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);
const parentOptions = props.parentOptions;

const rules: FormRules = {
  type: [{ required: true, message: "请选择组织类型", trigger: "change" }],
  name: [{ required: true, message: "请输入组织名称", trigger: "blur" }]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="上级组织" prop="parentId">
      <el-select
        v-model="newFormInline.parentId"
        placeholder="顶级组织"
        clearable
        filterable
        style="width: 100%"
      >
        <el-option
          v-for="p in parentOptions"
          :key="p.id"
          :label="p.label"
          :value="p.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="组织类型" prop="type">
      <el-select
        v-model="newFormInline.type"
        placeholder="请选择组织类型"
        style="width: 100%"
      >
        <el-option
          v-for="t in orgTypeOptions"
          :key="t.value"
          :label="t.label"
          :value="t.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="组织名称" prop="name">
      <el-input v-model="newFormInline.name" placeholder="请输入组织名称" />
    </el-form-item>
    <el-form-item label="负责人" prop="leader">
      <el-input v-model="newFormInline.leader" placeholder="请输入负责人" />
    </el-form-item>
    <el-form-item label="联系电话" prop="phone">
      <el-input v-model="newFormInline.phone" placeholder="请输入联系电话" />
    </el-form-item>
  </el-form>
</template>
