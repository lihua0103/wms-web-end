<script setup lang="ts">
import { reactive, ref } from "vue";
import { $t } from "@/plugins/i18n";
import type { FormRules } from "element-plus";
import type { AgvTaskItem } from "@/api/integration";

interface Props {
  formInline: Partial<AgvTaskItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  agvCode: [
    {
      required: true,
      message: $t("integration.agv.codeRequired"),
      trigger: "change"
    }
  ],
  taskType: [
    {
      required: true,
      message: $t("integration.agv.typeRequired"),
      trigger: "change"
    }
  ],
  fromLocation: [
    {
      required: true,
      message: $t("integration.agv.fromRequired"),
      trigger: "blur"
    }
  ],
  toLocation: [
    {
      required: true,
      message: $t("integration.agv.toRequired"),
      trigger: "blur"
    }
  ],
  priority: [
    {
      required: true,
      message: $t("integration.agv.priorityRequired"),
      trigger: "change"
    }
  ]
};

const agvOptions = [
  { value: "AGV-001", label: "AGV-001" },
  { value: "AGV-002", label: "AGV-002" },
  { value: "AGV-003", label: "AGV-003" },
  { value: "AGV-004", label: "AGV-004" },
  { value: "AGV-005", label: "AGV-005" },
  { value: "AGV-006", label: "AGV-006" }
];

const taskTypeOptions = [
  { value: "搬运", label: $t("integration.agv.typeCarry") },
  { value: "入库", label: $t("integration.agv.typeInbound") },
  { value: "出库", label: $t("integration.agv.typeOutbound") },
  { value: "充电", label: $t("integration.agv.typeCharge") }
];

const priorityOptions = [1, 2, 3, 4, 5].map(v => ({
  value: v,
  label:
    v >= 5
      ? $t("integration.agv.priorityHighest", { v })
      : v <= 1
        ? $t("integration.agv.priorityLowest", { v })
        : $t("integration.agv.priorityLevel", { v })
}));
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('integration.agv.code')" prop="agvCode">
      <el-select v-model="newFormInline.agvCode" style="width: 100%">
        <el-option
          v-for="a in agvOptions"
          :key="a.value"
          :label="a.label"
          :value="a.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('integration.agv.taskType')" prop="taskType">
      <el-select v-model="newFormInline.taskType" style="width: 100%">
        <el-option
          v-for="t in taskTypeOptions"
          :key="t.value"
          :label="t.label"
          :value="t.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      :label="$t('integration.agv.fromLocation')"
      prop="fromLocation"
    >
      <el-input
        v-model="newFormInline.fromLocation"
        :placeholder="$t('integration.agv.fromExample')"
      />
    </el-form-item>
    <el-form-item :label="$t('integration.agv.toLocation')" prop="toLocation">
      <el-input
        v-model="newFormInline.toLocation"
        :placeholder="$t('integration.agv.toExample')"
      />
    </el-form-item>
    <el-form-item :label="$t('integration.agv.priority')" prop="priority">
      <el-select v-model="newFormInline.priority" style="width: 100%">
        <el-option
          v-for="p in priorityOptions"
          :key="p.value"
          :label="p.label"
          :value="p.value"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
