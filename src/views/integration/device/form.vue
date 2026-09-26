<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { DeviceItem } from "@/api/integration";
import { deviceTypeOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<DeviceItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [{ required: true, message: "请输入设备编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  deviceType: [
    { required: true, message: "请选择设备类型", trigger: "change" }
  ],
  warehouseCode: [
    { required: true, message: "请选择所属仓库", trigger: "change" }
  ],
  ip: [
    { required: true, message: "请输入设备 IP 地址", trigger: "blur" },
    {
      pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
      message: "IP 地址格式不正确",
      trigger: "blur"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];

const zoneOptions = [
  { value: "A", label: "A 收货区" },
  { value: "B", label: "B 存储区" },
  { value: "C", label: "C 拣货区" },
  { value: "D", label: "D 发货区" }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="设备编码" prop="code">
      <el-input
        v-model="newFormInline.code"
        placeholder="如 AGV-007"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item label="设备名称" prop="name">
      <el-input v-model="newFormInline.name" placeholder="请输入设备名称" />
    </el-form-item>
    <el-form-item label="设备类型" prop="deviceType">
      <el-select
        v-model="newFormInline.deviceType"
        placeholder="请选择设备类型"
        style="width: 100%"
      >
        <el-option
          v-for="d in deviceTypeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="所属仓库" prop="warehouseCode">
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option
          v-for="w in warehouseOptions"
          :key="w.value"
          :label="w.label"
          :value="w.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="所在库区" prop="zoneCode">
      <el-select
        v-model="newFormInline.zoneCode"
        placeholder="请选择库区"
        clearable
        style="width: 100%"
      >
        <el-option
          v-for="z in zoneOptions"
          :key="z.value"
          :label="z.label"
          :value="z.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="IP 地址" prop="ip">
      <el-input v-model="newFormInline.ip" placeholder="如 192.168.10.11" />
    </el-form-item>
    <el-form-item label="厂商" prop="vendor">
      <el-input v-model="newFormInline.vendor" placeholder="请输入设备厂商" />
    </el-form-item>
  </el-form>
</template>
