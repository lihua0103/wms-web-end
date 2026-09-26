<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { NoticeItem } from "@/api/system";
import { noticeTypeOptions, noticeLevelOptions } from "./utils/hook";

interface Props {
  formInline: Partial<NoticeItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  title: [{ required: true, message: "请输入消息标题", trigger: "blur" }],
  type: [{ required: true, message: "请选择消息类型", trigger: "change" }],
  level: [{ required: true, message: "请选择级别", trigger: "change" }],
  content: [{ required: true, message: "请输入消息内容", trigger: "blur" }]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="消息标题" prop="title">
      <el-input v-model="newFormInline.title" placeholder="请输入消息标题" />
    </el-form-item>
    <el-form-item label="消息类型" prop="type">
      <el-radio-group v-model="newFormInline.type">
        <el-radio
          v-for="t in noticeTypeOptions"
          :key="t.value"
          :value="t.value"
        >
          {{ t.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="级别" prop="level">
      <el-radio-group v-model="newFormInline.level">
        <el-radio
          v-for="l in noticeLevelOptions"
          :key="l.value"
          :value="l.value"
        >
          {{ l.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="消息内容" prop="content">
      <el-input
        v-model="newFormInline.content"
        type="textarea"
        :rows="5"
        placeholder="请输入消息内容"
      />
    </el-form-item>
  </el-form>
</template>
