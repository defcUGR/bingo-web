import { defineStore } from 'pinia'

export const usePresenterTokenStore = defineStore('presenterToken', {
  state: () => ({
    token: null
  })
})
