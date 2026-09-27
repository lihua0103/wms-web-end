<script setup lang="ts">
import { hasAuth, getAuths } from "@/router/utils";

defineOptions({
  name: "PermissionButtonRouter"
});
</script>

<template>
  <div>
    <p class="mb-2!">
      {{ $t("system.permission.codeList", { list: getAuths() }) }}
    </p>

    <el-card shadow="never" class="mb-2">
      <template #header>
        <div class="card-header">
          {{ $t("system.permission.componentWay") }}
        </div>
      </template>
      <el-space wrap>
        <Auth value="permission:btn:add">
          <el-button plain type="warning">
            {{
              $t("system.permission.visibleWithCode", {
                code: "'permission:btn:add'"
              })
            }}
          </el-button>
        </Auth>
        <Auth :value="['permission:btn:edit']">
          <el-button plain type="primary">
            {{
              $t("system.permission.visibleWithCode", {
                code: "['permission:btn:edit']"
              })
            }}
          </el-button>
        </Auth>
        <Auth
          :value="[
            'permission:btn:add',
            'permission:btn:edit',
            'permission:btn:delete'
          ]"
        >
          <el-button plain type="danger">
            {{
              $t("system.permission.visibleWithCode", {
                code: "['permission:btn:add', 'permission:btn:edit', 'permission:btn:delete']"
              })
            }}
          </el-button>
        </Auth>
      </el-space>
    </el-card>

    <el-card shadow="never" class="mb-2">
      <template #header>
        <div class="card-header">{{ $t("system.permission.functionWay") }}</div>
      </template>
      <el-space wrap>
        <el-button v-if="hasAuth('permission:btn:add')" plain type="warning">
          {{
            $t("system.permission.visibleWithCode", {
              code: "'permission:btn:add'"
            })
          }}
        </el-button>
        <el-button v-if="hasAuth(['permission:btn:edit'])" plain type="primary">
          {{
            $t("system.permission.visibleWithCode", {
              code: "['permission:btn:edit']"
            })
          }}
        </el-button>
        <el-button
          v-if="
            hasAuth([
              'permission:btn:add',
              'permission:btn:edit',
              'permission:btn:delete'
            ])
          "
          plain
          type="danger"
        >
          {{
            $t("system.permission.visibleWithCode", {
              code: "['permission:btn:add', 'permission:btn:edit', 'permission:btn:delete']"
            })
          }}
        </el-button>
      </el-space>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          {{ $t("system.permission.directiveWay") }}
        </div>
      </template>
      <el-space wrap>
        <el-button v-auth="'permission:btn:add'" plain type="warning">
          {{
            $t("system.permission.visibleWithCode", {
              code: "'permission:btn:add'"
            })
          }}
        </el-button>
        <el-button v-auth="['permission:btn:edit']" plain type="primary">
          {{
            $t("system.permission.visibleWithCode", {
              code: "['permission:btn:edit']"
            })
          }}
        </el-button>
        <el-button
          v-auth="[
            'permission:btn:add',
            'permission:btn:edit',
            'permission:btn:delete'
          ]"
          plain
          type="danger"
        >
          {{
            $t("system.permission.visibleWithCode", {
              code: "['permission:btn:add', 'permission:btn:edit', 'permission:btn:delete']"
            })
          }}
        </el-button>
      </el-space>
    </el-card>
  </div>
</template>
