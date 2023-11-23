<template>
  <main class="relative flex flex-col justify-center items-center min-h-screen w-screen">
    <h1 class="absolute top-4 mx-8 text-8xl font-alex-brush font-bold text-center">Bingo 25 N</h1>
    <div
      v-if="showResult"
      ref="animation"
      class="flex items-center justify-center text-center rounded-full bg-base-300 dark:bg-base-content text-secondary dark:text-primary-focus py-4 px-5 text-6xl font-semibold"
    >
      {{ showResult }}
    </div>
  </main>
</template>

<script setup lang="ts">
import { io } from 'socket.io-client'
import { type Ref, ref } from 'vue'
import { useAutoAnimate } from '@formkit/auto-animate/vue'
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string

const socket = io(`${BACKEND_BASE_URL}/viewer`)

const showResult: Ref<undefined | string> = ref()

socket.on('result', (data) => {
  showResult.value = data
})

const [animation, enableAnimation] = useAutoAnimate((el, action, oldCoords, newCoords) => {
  const keyframes = [
    { transform: 'scale(1.15)', opacity: 1, offset: 0.75 },
    { transform: 'scale(1)', opacity: 1 }
  ]
  return new KeyframeEffect(el, keyframes, { duration: 400, easing: 'ease-out' })
})
</script>
