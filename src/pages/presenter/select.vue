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
          <option v-for="bingo in bingos" :key="bingo.key" :value="bingo.key">
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
import { usePresenterTokenStore } from '../../stores/presenterToken'
import { tryit } from 'radash'
import { useNotification } from '@kyvg/vue3-notification'

const { notify } = useNotification()
const router = useRouter()
const tokenStore = usePresenterTokenStore()

const loadingBingos = ref(true)
const bingos = ref([] as { key: string; value: string }[])
const selectedBingo = ref(null)

const loadingToBingo = ref(false)
const toBingo = async () => {
  if (!(tokenStore.token && selectedBingo)) return
  loadingToBingo.value = true
  // console.info('res', await fetch('http://localhost:3000/api/authPresenter?query=one'))
  const [err, data] = await tryit(fetch)(
    `http://localhost:3000/api/authPresenter?token=${tokenStore.token}`
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
  router.push(`/presenter/ongoing?bingo=${selectedBingo.value}`)
}

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
  bingos.value = await data.json()
})()
</script>
