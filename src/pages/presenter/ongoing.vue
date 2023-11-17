<template>
  <main class="relative flex flex-col justify-center items-center min-h-screen w-screen">
    <div class="absolute top-4">
      <h1 class="!inline-block">
        Vista de presentador: {{ availableBingosStore.selected?.value }}
      </h1>
      <button class="!inline-block btn btn-ghost btn-sm ml-2" @click="backSelect">
        <span class="underline">Cambiar bingo</span>
        <IconArrowUpRight class="inline max-h-full mb-0.5" />
      </button>
    </div>

    <div
      class="h-24 w-24 flex items-center justify-center rounded-lg bg-base-300 text-secondary dark:bg-base-content dark:text-primary-focus py-4 px-5 text-6xl font-semibold"
    >
      {{ showResult ?? '...' }}
    </div>
    <h2 class="text-3xl mt-4 mb-3">{{ showName ?? 'Esperando...' }}</h2>

    <div class="absolute bottom-4 text-sm text-center">
      <p class="break-words w-[90vw] mb-2">
        <span v-for="item in historyResults" :key="item" class="mr-1">{{ item }}</span>
      </p>
      <p class="mb-2">Pulsa <kbd class="kbd">Espacio</kbd> para generar el siguiente símbolo</p>
      <p>Pulsa <kbd class="kbd">Ctrl+Retroceso</kbd> para resetear los resultados</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { usePresenterTokenStore } from '@/stores/presenterToken'
import { useAvailableBingosStore } from '@/stores/availableBingos'
import { IconArrowUpRight } from '@tabler/icons-vue'
import { onKeyDown, useKeyModifier } from '@vueuse/core'
import { io } from 'socket.io-client'
import { type Ref, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotification } from '@kyvg/vue3-notification'

const router = useRouter()
const { notify } = useNotification()
const tokenStore = usePresenterTokenStore()
const availableBingosStore = useAvailableBingosStore()

if (!tokenStore.token || !availableBingosStore.selected) {
  router.push('/presenter/select')
  notify({
    text: 'Vista restringida a presentador',
    type: 'error'
  })
}

const socket = io('http://localhost:3000/presenter')

const showResult: Ref<undefined | string> = ref()
const showName: Ref<undefined | string> = ref()
const historyResults = ref([] as string[])

const controlKey = useKeyModifier('Control')
onKeyDown(
  ['Backspace'],
  () => {
    if (controlKey.value) {
      socket.emit(
        'clear',
        { bingo: availableBingosStore.selected!.key, authToken: tokenStore.token },
        (cbk: { error: string | null }) => {
          if (cbk.error) {
            notify({
              type: 'error',
              text: cbk.error
            })
          } else {
            historyResults.value = []
            showResult.value = undefined
            showName.value = undefined
            notify({
              type: 'success',
              text: 'Resultados anteriores limpiados'
            })
          }
        }
      )
    }
  },
  { dedupe: true }
)
onKeyDown(
  ['Spacebar', ' '],
  () => {
    console.info('pressed space')
    socket.emit(
      'next',
      {
        bingo: availableBingosStore.selected!.key,
        authToken: tokenStore.token
      },
      (
        incoming:
          | { error: string; result: undefined }
          | {
              error: null
              result: { key: string; value: string }
            }
      ) => {
        if (incoming.error) {
          notify({
            type: 'error',
            text: incoming.error
          })
          return
        }
        if (showResult.value) historyResults.value.push(showResult.value)
        showResult.value = incoming.result?.key
        showName.value = incoming.result?.value
      }
    )
  },
  { dedupe: true }
)

const backSelect = () => router.push('/presenter/select')
</script>
