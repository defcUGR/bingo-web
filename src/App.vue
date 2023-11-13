<template>
  <RouterView />
  <notifications position="bottom center">
    <template #body="props">
      <div class="alert flex flex-row mb-4" :class="`alert-${props.item.type}`">
        <component
          class="flex-grow-0 flex-shrink-0"
          :is="notificationComponent(props.item.type)"
        ></component>
        <p class="flex-grow text-left">{{ props.item.text }}</p>
        <button class="flex-grow-0 flex-shrink-0" @click="props.close">
          <i class="fa fa-fw fa-close"></i>
        </button>
      </div>
    </template>
  </notifications>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconCircleCheck, IconCircleX, IconInfoCircle } from '@tabler/icons-vue'

const notificationComponent = (type: string) =>
  ({
    error: IconCircleX,
    warning: IconAlertTriangle,
    success: IconCircleCheck,
    info: IconInfoCircle
  })[type]
</script>
