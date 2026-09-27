<script setup lang="ts">
defineOptions({ name: "InventoryWarning" });
</script>

<template>
  <div class="p-4 text-gray-500">
    {{ $t("inventory.warning.title") }} - {{ $t("inventory.warning.building") }}
  </div>
</template>
