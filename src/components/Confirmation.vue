<template>
  <dialog
    @keyup.esc="
      () => {
        modal?.close()
        $emit('cancel')
      }
    "
    ref="modal"
    :id="id"
    class="modal"
  >
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ title }}</h3>
      <p class="py-4">{{ message }}</p>
      <div class="modal-action">
        <form method="dialog">
          <button @click="$emit('cancel')" class="btn mr-2">Cancelar</button>
          <button @click="$emit('confirm')" class="btn btn-error ml-2">Confirmar</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="$emit('cancel')">Cancelar</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { useActiveElement } from '@vueuse/core'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  id: string
  title: string
  message: string
}>()

const emit = defineEmits(['cancel', 'confirm'])

const modal = ref<HTMLDialogElement | null>(null)
const activeElement = useActiveElement()

onMounted(() => {
  modal.value?.showModal()
  activeElement.value?.blur()
})
</script>
