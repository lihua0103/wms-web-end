<script setup lang="ts">
defineOptions({ name: "InventoryTransaction" });
</script>

<template>
  <div class="p-4 text-gray-500">
    {{ $t("inventory.transaction.title") }} -
    {{ $t("inventory.transaction.building") }}
  </div>
</template>
