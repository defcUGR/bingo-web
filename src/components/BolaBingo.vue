<template>
  <div class="btn btn-secondary btn-circle text-3xl m-4 animate-none hover:bg-secondary">
    {{ result }}
  </div>
</template>

<script setup lang="ts">
defineProps({
  result: {
    type: String,
    required: true
  }
})
</script>
