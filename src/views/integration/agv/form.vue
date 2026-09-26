<script setup lang="ts">
import { reactive, ref } from "vue";
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
  agvCode: [{ required: true, message: "请选择 AGV 编号", trigger: "change" }],
  taskType: [{ required: true, message: "请选择任务类型", trigger: "change" }],
  fromLocation: [
    { required: true, message: "请输入起始库位", trigger: "blur" }
  ],
  toLocation: [{ required: true, message: "请输入目标库位", trigger: "blur" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }]
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
  { value: "搬运", label: "搬运" },
  { value: "入库", label: "入库" },
  { value: "出库", label: "出库" },
  { value: "充电", label: "充电" }
];

const priorityOptions = [1, 2, 3, 4, 5].map(v => ({
  value: v,
  label: `${v} 级${v >= 5 ? "（最紧急）" : v <= 1 ? "（最低）" : ""}`
}));
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="AGV 编号" prop="agvCode">
      <el-select v-model="newFormInline.agvCode" style="width: 100%">
        <el-option
          v-for="a in agvOptions"
          :key="a.value"
          :label="a.label"
          :value="a.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="任务类型" prop="taskType">
      <el-select v-model="newFormInline.taskType" style="width: 100%">
        <el-option
          v-for="t in taskTypeOptions"
          :key="t.value"
          :label="t.label"
          :value="t.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="起始库位" prop="fromLocation">
      <el-input v-model="newFormInline.fromLocation" placeholder="如 A-01-01" />
    </el-form-item>
    <el-form-item label="目标库位" prop="toLocation">
      <el-input v-model="newFormInline.toLocation" placeholder="如 C-02-03" />
    </el-form-item>
    <el-form-item label="优先级" prop="priority">
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
