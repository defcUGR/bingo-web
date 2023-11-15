<template>
  <main class="relative flex flex-col items-center min-h-screen w-screen dark:bg-base-100">
    <h1 class="!inline-block mt-4 text-xl font-bold">Vista de voluntario</h1>
    <p v-if="loadingBingos">Cargando bingos...</p>
    <p v-else-if="!loadingBingos && !availableBingosStore.bingos">
      No se ha podido obtener los bingos disponibles :(
    </p>
    <p v-else-if="loadingHistory">Cargando historial...</p>
    <p v-else-if="!loadingHistory && !history">No se ha podido obtener el historial :(</p>
    <div v-else class="flex flex-col items-center">
      <nav v-if="availableBingosStore.bingos?.length ?? 0 > 1" class="tabs tabs-boxed mt-4 w-fit">
        <button
          v-for="bingo in availableBingosStore.bingos"
          :key="bingo.key"
          class="tab"
          :class="bingo.key === availableBingosStore.selected?.key ? 'tab-active' : ''"
          @click="availableBingosStore.selected = bingo"
        >
          {{ bingo.value }}
        </button>
      </nav>
      <p v-if="!availableBingosStore.selected" class="mt-4">
        Selecciona un bingo para ver el historial
      </p>
      <p v-else-if="selectedBingoHistory?.length === 0" class="mt-4">
        Aun no hay ningún resultado para mostrar
      </p>
      <div v-else class="flex mt-4 w-10/12 flex-wrap justify-center">
        <div
          v-for="result in selectedBingoHistory"
          :key="result.key"
          class="h-16 w-16 mx-4 my-4 flex items-center justify-center rounded-lg bg-base-300 text-secondary py-4 px-5 text-4xl font-semibold dark:bg-base-content dark:text-primary-focus"
        >
          {{ result.key }}
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { type Ref, ref, computed } from 'vue'
import { io } from 'socket.io-client'
import { tryit } from 'radash'
import { useNotification } from '@kyvg/vue3-notification'
import { useAvailableBingosStore } from '@/stores/availableBingos'

const { notify } = useNotification()
const availableBingosStore = useAvailableBingosStore()

const history: Ref<
  | null
  | {
      key: string
      value: string
      results: {
        key: string
        index: number
      }[]
    }[]
> = ref(null)
const loadingBingos = ref(true)
const loadingHistory = ref(false)
const selectedBingoHistory = computed(() => {
  if (!availableBingosStore.selected) return null
  return (
    history.value
      ?.find((b) => b.key === availableBingosStore.selected?.key)
      ?.results.sort((a, b) => a.index - b.index) ?? []
  )
})

;(async () => {
  const [err, data] = await tryit(fetch)(`http://localhost:3000/api/bingos`)
  loadingBingos.value = false
  if (err) {
    notify({
      text: 'Error al cargar los bingos disponibles',
      type: 'error'
    })
    return
  }
  availableBingosStore.bingos = await data.json()
})()
;(async () => {
  loadingHistory.value = true
  const [err, data] = await tryit(fetch)(`http://localhost:3000/api/history`)
  loadingHistory.value = false
  if (err) {
    notify({
      text: 'Error al cargar el historial',
      type: 'error'
    })
    return
  }
  history.value = await data.json()
})()

const socket = io('http://localhost:3000/volunteer')
socket
  .on('result', (data: { bingo: string; key: string; index: number }) => {
    if (!history.value) return
    const bingo = history.value.find((b) => b.key === data.bingo)
    if (!bingo) return
    bingo.results.push({ key: data.key, index: data.index })
  })
  .on('clear', (data: string) => {
    if (!history.value) return
    const bingo = history.value.find((b) => b.key === data)
    if (!bingo) return
    bingo.results = []
  })
</script>
