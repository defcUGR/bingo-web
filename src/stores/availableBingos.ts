import { defineStore } from 'pinia'

type bingo = {
  key: string
  value: string
}

export const useAvailableBingosStore = defineStore('availableBingos', {
  state: () => ({
    bingos: null as bingo[] | null,
    selected: null as bingo | null
  })
})
