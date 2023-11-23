<template>
  <RouterView />
  <notifications position="top left" class="ml-4">
    <template #body="props">
      <div class="alert flex flex-row mt-4" :class="`alert-${props.item.type}`">
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

  <div
    v-if="socketOffline"
    class="bg-opacity-75 bg-zinc-900 w-screen h-screen fixed z-50 inset-0 flex flex-row items-center justify-center"
  >
    <span class="loading loading-ring loading-lg mr-4"></span>
    <p>Conectando al servidor...</p>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconCircleCheck, IconCircleX, IconInfoCircle } from '@tabler/icons-vue'
import { io } from 'socket.io-client'
import { ref } from 'vue'
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string

const notificationComponent = (type: string) =>
  ({
    error: IconCircleX,
    warning: IconAlertTriangle,
    success: IconCircleCheck,
    info: IconInfoCircle
  })[type]

const socketOffline = ref(true)
const socket = io(`${BACKEND_BASE_URL}`)

socket.on('connect', () => {
  socketOffline.value = false
  socket.disconnect()
})
</script>
