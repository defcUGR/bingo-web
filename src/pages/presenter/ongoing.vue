<template>
  <main class="relative flex flex-col justify-center items-center min-h-screen w-screen">
    <Confirmation
      v-if="showConfirmation"
      :id="'resetResultsConfirmation'"
      :title="'Atención'"
      :message="'Estás a punto de eliminar todos los resultados de este bingo, ¿estás seguro?'"
      @confirm="clearResults"
      @cancel="() => (showConfirmation = false)"
    />

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

    <div v-if="!showMobileView" class="absolute bottom-4 text-sm text-center">
      <p class="break-words w-[90vw] mb-2">
        <span v-for="item in historyResults" :key="item" class="mr-1">{{ item }}</span>
      </p>
      <p class="mb-2">Pulsa <kbd class="kbd">Espacio</kbd> para generar el siguiente símbolo</p>
      <p>Pulsa <kbd class="kbd">Ctrl+Retroceso</kbd> para resetear los resultados</p>
    </div>
    <div v-else class="absolute bottom-4 flex flex-col text-sm text-center items-center">
      <p class="break-words w-[90vw] mb-4">
        <span v-for="item in historyResults" :key="item" class="mr-1">{{ item }}</span>
      </p>
      <div class="flex flex-col w-fit">
        <button @click="newValue" class="btn btn-primary mb-4">Generar nuevo resultado</button>
        <button
          @click="
            () => {
              showConfirmation = true
            }
          "
          class="btn btn-error"
        >
          Resetear resultados
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { usePresenterTokenStore } from '@/stores/presenterToken'
import { useAvailableBingosStore } from '@/stores/availableBingos'
import { IconArrowUpRight } from '@tabler/icons-vue'
import { onKeyDown, useKeyModifier, useWindowSize } from '@vueuse/core'
import { io } from 'socket.io-client'
import { type Ref, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotification } from '@kyvg/vue3-notification'
import Confirmation from '@/components/Confirmation.vue'
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string

const router = useRouter()
const { notify } = useNotification()
const tokenStore = usePresenterTokenStore()
const availableBingosStore = useAvailableBingosStore()
const { width } = useWindowSize()

if (!tokenStore.token || !availableBingosStore.selected) {
  router.push('/presenter/select')
  notify({
    text: 'Vista restringida a presentador',
    type: 'error'
  })
}

const socket = io(`${BACKEND_BASE_URL}/presenter`)

const showResult: Ref<undefined | string> = ref()
const showName: Ref<undefined | string> = ref()
const historyResults = ref([] as string[])
const showConfirmation = ref(false)

const controlKey = useKeyModifier('Control')
onKeyDown(
  ['Backspace'],
  () => {
    if (controlKey.value) showConfirmation.value = true
  },
  { dedupe: true }
)
onKeyDown(['Spacebar', ' '], () => newValue(), { dedupe: true })

function newValue() {
  console.info('requested new value')
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
}

function clearResults() {
  showConfirmation.value = false
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

const showMobileView = computed(() => width.value < 768)

const backSelect = () => router.push('/presenter/select')
</script>
