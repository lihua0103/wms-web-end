<script setup lang="ts">
import { hasPerms } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";

const { permissions } = useUserStoreHook();

defineOptions({
  name: "PermissionButtonLogin"
});
</script>

<template>
  <div>
    <p class="mb-2!">
      {{ $t("system.permission.codeList", { list: permissions }) }}
    </p>
    <p v-show="permissions?.[0] === '*:*:*'" class="mb-2!">
      {{ $t("system.permission.allPermsTip") }}
    </p>

    <el-card shadow="never" class="mb-2">
      <template #header>
        <div class="card-header">
          {{ $t("system.permission.componentWay") }}
        </div>
      </template>
      <el-space wrap>
        <Perms value="permission:btn:add">
          <el-button plain type="warning">
            {{
              $t("system.permission.visibleWithCode", {
                code: "'permission:btn:add'"
              })
            }}
          </el-button>
        </Perms>
        <Perms :value="['permission:btn:edit']">
          <el-button plain type="primary">
            {{
              $t("system.permission.visibleWithCode", {
                code: "['permission:btn:edit']"
              })
            }}
          </el-button>
        </Perms>
        <Perms
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
        </Perms>
      </el-space>
    </el-card>

    <el-card shadow="never" class="mb-2">
      <template #header>
        <div class="card-header">{{ $t("system.permission.functionWay") }}</div>
      </template>
      <el-space wrap>
        <el-button v-if="hasPerms('permission:btn:add')" plain type="warning">
          {{
            $t("system.permission.visibleWithCode", {
              code: "'permission:btn:add'"
            })
          }}
        </el-button>
        <el-button
          v-if="hasPerms(['permission:btn:edit'])"
          plain
          type="primary"
        >
          {{
            $t("system.permission.visibleWithCode", {
              code: "['permission:btn:edit']"
            })
          }}
        </el-button>
        <el-button
          v-if="
            hasPerms([
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
        <el-button v-perms="'permission:btn:add'" plain type="warning">
          {{
            $t("system.permission.visibleWithCode", {
              code: "'permission:btn:add'"
            })
          }}
        </el-button>
        <el-button v-perms="['permission:btn:edit']" plain type="primary">
          {{
            $t("system.permission.visibleWithCode", {
              code: "['permission:btn:edit']"
            })
          }}
        </el-button>
        <el-button
          v-perms="[
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
