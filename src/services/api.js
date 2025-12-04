import axios from 'axios'
import { useHabiticaStore } from '../stores/useHabiticaStore'

function getAxios() {
  const store = useHabiticaStore()
  const instance = axios.create({
    baseURL: 'https://habitica.com/api/v3',
    headers: {
      'x-client': 'habitica-dashboard',
      ...(store.userId && { 'x-api-user': store.userId }),
      ...(store.apiKey && { 'x-api-key': store.apiKey }),
    }
  })
  return instance
}

export async function fetchUser() {
  return getAxios().get('/user')
}

export async function fetchDailies() {
  return getAxios().get('/tasks/user?type=dailys')
}

export async function markDailyUp(id) {
  return getAxios().post(`/tasks/${id}/score/up`)
}

export async function fetchTags() {
  // Habitica tags endpoint returns user's tags
  return getAxios().get('/tags')
}

export async function updateTask(id, updates) {
  return getAxios().put(`/tasks/${id}`, updates)
}
