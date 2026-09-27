<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: { id: number; taskNo: string; assignee: string };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  assignee: [
    {
      required: true,
      message: $t("operation.task.selectAssignee"),
      trigger: "change"
    }
  ]
};

const userOptions = [
  { value: "user002", label: $t("operation.task.user002") },
  { value: "user003", label: $t("operation.task.user003") },
  { value: "user004", label: $t("operation.task.user004") },
  { value: "user005", label: $t("operation.task.user005") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="80px"
  >
    <el-form-item :label="$t('operation.task.taskNo')">
      <el-input :model-value="newFormInline.taskNo" disabled />
    </el-form-item>
    <el-form-item :label="$t('operation.task.assignee')" prop="assignee">
      <el-select
        v-model="newFormInline.assignee"
        :placeholder="$t('operation.task.selectAssignee')"
        style="width: 100%"
      >
        <el-option
          v-for="u in userOptions"
          :key="u.value"
          :label="u.label"
          :value="u.value"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
