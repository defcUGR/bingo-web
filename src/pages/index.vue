<template>
  <header class="flex items-center justify-center">
    <button class="btn btn-active bg-white hover:bg-white h-fit w-11/12 p-2 my-4">
      <img :src="LogoBingo" alt="Bingo con Andrés" />
    </button>
  </header>
  <main class="flex flex-col items-center justify-center">
    <button @click="start" class="btn btn-info w-fit">Start</button>
    <Transition
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
      :css="false"
      mode="out-in"
    >
      <BolaBingo v-if="result" :result="result" :key="result" />
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { ref, shallowRef, h, watch } from 'vue'
import io from 'socket.io-client'
import LogoBingo from '@/assets/LogoBingo.svg'
import gsap from 'gsap'
import BolaBingo from '@/components/BolaBingo.vue'

const socket = io('http://localhost:3000')
const result = ref('')

socket.on('result', (data) => {
  result.value = data
})

function onBeforeEnter(el) {
  gsap.set(el, {
    scaleX: 0.25,
    scaleY: 0.25,
    opacity: 1
  })
}

function onEnter(el, done) {
  gsap.to(el, {
    duration: 1,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    ease: 'elastic.inOut(2.5, 1)',
    onComplete: done
  })
}

function onLeave(el, done) {
  gsap.to(el, {
    duration: 1,
    scaleX: 0,
    scaleY: 0,
    opacity: 0,
    ease: 'elastic.inOut(2.5, 1)',
    onComplete: done
  })
}

function start() {
  result.value = '0'
  setTimeout(() => {
    result.value = '1'
  }, 2000)

  setTimeout(() => {
    result.value = '2'
  }, 4000)
}
</script>
