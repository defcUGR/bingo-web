<template>
  <main class="relative flex flex-col justify-center items-center min-h-screen w-screen">
    <div class="absolute top-4">
      <h1 class="!inline-block">Bingo: {{ selectedBingo }}</h1>
    </div>

    <div
      class="h-24 w-24 flex items-center justify-center rounded-lg bg-base-content text-primary-focus py-4 px-5 text-6xl font-semibold"
    >
      {{ showResult ?? '...' }}
    </div>
    <div class="absolute bottom-4 text-sm text-center">
      <p>Cositas</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { IconArrowUpRight } from '@tabler/icons-vue'
import { onKeyDown, useKeyModifier } from '@vueuse/core'
import { io } from 'socket.io-client'
import { computed, type Ref, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotification } from '@kyvg/vue3-notification'

const router = useRouter()
const route = useRoute()
const { notify } = useNotification()

const socket = io('http://localhost:3000')

const selectedBingo = route.query.bingo
const showResult: Ref<undefined | string> = ref()

socket.on('result', (data) => {
  showResult.value = data
})
</script>
