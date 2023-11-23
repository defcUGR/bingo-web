<template>
  <main class="relative flex flex-col justify-center items-center min-h-screen w-screen">
    <div class="bg-base-300 rounded-lg py-4 px-5">
      <h1 class="font-black tracking-wide text-xl">Acceder a vista de presentador</h1>

      <div class="form-control">
        <label for="token" class="label label-text">Token de acceso</label>
        <input
          id="token"
          name="token"
          type="password"
          class="input"
          placeholder="BZ6xbGWa73a3BbqfXDnn45n3..."
          v-model="tokenStore.token"
        />
      </div>

      <div class="form-control mt-1">
        <label class="label">
          <span class="label-text">Bingo</span>
        </label>
        <select class="select" v-model="selectedBingo">
          <option disabled selected :value="null">-- Seleccionar --</option>
          <option v-for="bingo in availableBingosStore.bingos" :key="bingo.key" :value="bingo.key">
            {{ bingo.value }}
          </option>
        </select>
      </div>

      <button
        class="btn w-full mt-4 btn-primary"
        :disabled="!(tokenStore.token && selectedBingo)"
        @click="toBingo"
      >
        <span class="loading loading-spinner" v-show="loadingToBingo"></span>
        Continuar
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePresenterTokenStore } from '@/stores/presenterToken'
import { useAvailableBingosStore } from '@/stores/availableBingos'
import { tryit } from 'radash'
import { useNotification } from '@kyvg/vue3-notification'
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string

const { notify } = useNotification()
const router = useRouter()
const tokenStore = usePresenterTokenStore()
const availableBingosStore = useAvailableBingosStore()

const loadingBingos = ref(true)
const selectedBingo = ref(null)

const loadingToBingo = ref(false)
const toBingo = async () => {
  if (!(tokenStore.token && selectedBingo)) return
  availableBingosStore.selected = availableBingosStore.bingos!.find(
    (b) => b.key === selectedBingo.value
  )!
  loadingToBingo.value = true
  // console.info('res', await fetch('http://localhost:3000/api/authPresenter?query=one'))
  const [err, data] = await tryit(fetch)(
    `${BACKEND_BASE_URL}/api/authPresenter?token=${tokenStore.token}`
  )
  console.info('ress', data, err)
  if (err) {
    notify({
      text: 'Error al solicitar validación del token',
      type: 'error'
    })
    loadingToBingo.value = false
    return
  }
  if (!(await data.json())) {
    notify({
      text: 'Token no válido',
      type: 'error'
    })
    loadingToBingo.value = false
    return
  }
  router.push(`/presenter/ongoing`)
}

;(async () => {
  const [err, data] = await tryit(fetch)(`${BACKEND_BASE_URL}/api/bingos`)
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
</script>
