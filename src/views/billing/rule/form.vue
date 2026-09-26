<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { FeeRuleItem } from "@/api/billing";
import { feeTypeOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<FeeRuleItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [{ required: true, message: "请输入规则编码", trigger: "blur" }],
  ownerName: [{ required: true, message: "请选择货主", trigger: "change" }],
  feeType: [{ required: true, message: "请选择费用类型", trigger: "change" }],
  unit: [{ required: true, message: "请选择计费单位", trigger: "change" }],
  effectiveFrom: [{ required: true, message: "请选择生效日期", trigger: "change" }]
};

const ownerOptions = [
  { value: "货主A 华东电子", label: "货主A 华东电子" },
  { value: "货主B 精工机械", label: "货主B 精工机械" },
  { value: "货主C 日化用品", label: "货主C 日化用品" },
  { value: "自营", label: "自营" }
];

const unitOptions = ["托/天", "件", "次", "票"].map(u => ({ value: u, label: u }));
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="规则编码" prop="code">
      <el-input
        v-model="newFormInline.code"
        placeholder="请输入规则编码"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item label="货主" prop="ownerName">
      <el-select v-model="newFormInline.ownerName" placeholder="请选择货主" style="width: 100%">
        <el-option v-for="o in ownerOptions" :key="o.value" :label="o.label" :value="o.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="费用类型" prop="feeType">
      <el-select v-model="newFormInline.feeType" placeholder="请选择费用类型" style="width: 100%">
        <el-option v-for="d in feeTypeOptions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="计费单位" prop="unit">
      <el-select v-model="newFormInline.unit" placeholder="请选择计费单位" style="width: 100%">
        <el-option v-for="u in unitOptions" :key="u.value" :label="u.label" :value="u.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="单价（元）" prop="price">
      <el-input-number
        v-model="newFormInline.price"
        :min="0"
        :precision="2"
        :step="0.5"
        controls-position="right"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item label="最低费用" prop="minimumFee">
      <el-input-number
        v-model="newFormInline.minimumFee"
        :min="0"
        :precision="2"
        :step="50"
        controls-position="right"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item label="生效日期" prop="effectiveFrom">
      <el-date-picker
        v-model="newFormInline.effectiveFrom"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="请选择生效日期"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item label="失效日期" prop="effectiveTo">
      <el-date-picker
        v-model="newFormInline.effectiveTo"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="请选择失效日期"
        style="width: 100%"
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
