<template>
  <main class="relative flex flex-col justify-center items-center min-h-screen w-screen">
    <div class="absolute top-4">
      <h1 class="!inline-block">Vista de presentador: {{ selectedBingo }}</h1>
      <button class="!inline-block btn btn-ghost btn-sm ml-2" @click="backSelect">
        <span class="underline">Cambiar bingo</span>
        <IconArrowUpRight class="inline max-h-full mb-0.5" />
      </button>
    </div>

    <div
      class="h-24 w-24 flex items-center justify-center rounded-lg bg-base-content text-primary-focus py-4 px-5 text-6xl font-semibold"
    >
      {{ showResult ?? '...' }}
    </div>
    <h2 class="text-3xl mt-4 mb-3">{{ showName ?? 'Esperando...' }}</h2>

    <div class="absolute bottom-4 text-sm text-center">
      <p class="break-words w-[90vw] mb-2">
        <span v-for="item in historyResults" :key="item" class="mr-1">{{ item }}</span>
      </p>
      <p>Pulsa <kbd class="kbd">Espacio</kbd> para generar el siguiente símbolo</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { usePresenterTokenStore } from '@/stores/presenterToken'
import { IconArrowUpRight } from '@tabler/icons-vue'
import { onKeyDown } from '@vueuse/core'
import { io } from 'socket.io-client'
import { computed, Ref, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NUMBERS } from '../../names'
import { useNotification } from '@kyvg/vue3-notification'

const router = useRouter()
const route = useRoute()
const { notify } = useNotification()
const tokenStore = usePresenterTokenStore()

if (!tokenStore.token) {
  router.push('/presenter/select')
  notify({
    text: 'Vista restringida a presentador',
    type: 'error'
  })
}

const socket = io('http://localhost:3000/presenter')

const selectedBingo = route.query.bingo
const showResult: Ref<undefined | string> = ref()
const historyResults = ref([] as string[])

const showName = computed(() => {
  if (!showResult.value) return null
  return NUMBERS[parseInt(showResult.value) - 1]
})

onKeyDown(
  ['Spacebar', ' '],
  () => {
    console.info('pressed space')
    socket.emit(
      'next',
      {
        bingo: selectedBingo,
        authToken: 'Limc62hquMHk8LGzURZpmhaKSetTq7z2JxD53Xuo'
      },
      (incoming: { result: string; id: number; bingo: string }) => {
        console.info('incoming', incoming)
        if (showResult.value) historyResults.value.push(showResult.value)
        showResult.value = incoming.result
      }
    )
  },
  { dedupe: true }
)

const backSelect = () => router.push('/presenter/select')
</script>
