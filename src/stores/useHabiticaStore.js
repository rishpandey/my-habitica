import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { fetchUser, fetchDailies, markDailyUp, fetchTags, updateTask } from '../services/api'

const LS_USER = 'HABITICA_USER_ID'
const LS_KEY = 'HABITICA_API_KEY'
const LS_TASKS = 'HABITICA_TASKS'
const LS_PENDING_UPDATES = 'HABITICA_PENDING_UPDATES'

export const useHabiticaStore = defineStore('habitica', () => {
  const userId = ref(localStorage.getItem(LS_USER) || '')
  const apiKey = ref(localStorage.getItem(LS_KEY) || '')
  const user = ref(null)
  const tasks = ref([])
  const loading = ref(false)
  const toastMessage = ref('')
  const toastTimer = ref(null)
  const selectedTags = ref([])
  const tagMap = ref({})
  const completionFilter = ref('not-done') // 'all' | 'done' | 'not-done'
  const pendingUpdates = ref([])
  let syncTimer = null

  function setUserId(v) {
    userId.value = v
    localStorage.setItem(LS_USER, v)
  }
  function setApiKey(v) {
    apiKey.value = v
    localStorage.setItem(LS_KEY, v)
  }

  const hasCreds = computed(() => !!(userId.value && apiKey.value))

  async function refreshAll() {
    if (!hasCreds.value) return

    // Load from localStorage immediately for instant UI
    const cached = localStorage.getItem(LS_TASKS)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        tasks.value = parsed.tasks || []
        if (parsed.tagMap) tagMap.value = parsed.tagMap
        if (parsed.user) user.value = parsed.user
      } catch (e) {
        console.error('Failed to parse cached tasks', e)
      }
    }

    // Fetch from API in background
    loading.value = true
    try {
      const [uRes, tRes, tagsRes] = await Promise.all([fetchUser(), fetchDailies(), fetchTags().catch(()=>({data:{data:[]}}))])
      user.value = uRes.data.data
      tasks.value = tRes.data.data || []
      // build tag map by merging any embedded tag objects in tasks and the tags endpoint
      const map = {}
      // 1) scan tasks for embedded tag objects
      for (const task of tasks.value) {
        const tagsArr = task.tags || []
        for (const tg of tagsArr) {
          if (!tg) continue
          if (typeof tg !== 'string') {
            const id = tg.id || tg._id || tg._id || tg.uuid || tg._id
            const name = tg.name || tg.text || tg.label || tg.id || ''
            if (id && name) map[id] = name
          }
        }
      }
      // 2) merge tags from tags endpoint (will fill names for ids)
      const tagsArr = (tagsRes && tagsRes.data && tagsRes.data.data) ? tagsRes.data.data : []
      for (const tg of tagsArr) {
        if (!tg) continue
        const id = tg.id || tg._id || tg._id || tg.uuid || tg._id
        const name = tg.name || tg.text || tg.label || tg.id || ''
        if (id && name) map[id] = name
      }
      tagMap.value = map

      // Save to localStorage
      localStorage.setItem(LS_TASKS, JSON.stringify({
        tasks: tasks.value,
        tagMap: tagMap.value,
        user: user.value,
        timestamp: Date.now()
      }))
    } catch (err) {
      console.error('fetch error', err)
    } finally {
      loading.value = false
    }
  }

  async function markDone(taskId) {
    if (!hasCreds.value) return

    // Update localStorage immediately
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.completed = true
      saveToLocalStorage()
      setToast('Marked done')

      // Queue API update for background sync
      queueUpdate({ type: 'markDone', taskId })
    }
  }

  function updateTaskNotes(taskId, notes) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.notes = notes
      saveToLocalStorage()
      setToast('Notes saved')

      // Queue API update for background sync
      queueUpdate({ type: 'updateNotes', taskId, notes })
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem(LS_TASKS, JSON.stringify({
      tasks: tasks.value,
      tagMap: tagMap.value,
      user: user.value,
      timestamp: Date.now()
    }))
  }

  function queueUpdate(update) {
    pendingUpdates.value.push(update)
    localStorage.setItem(LS_PENDING_UPDATES, JSON.stringify(pendingUpdates.value))

    // Debounce sync to avoid hammering API
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(() => processPendingUpdates(), 1000)
  }

  async function processPendingUpdates() {
    if (!pendingUpdates.value.length || !hasCreds.value) return

    const updates = [...pendingUpdates.value]
    pendingUpdates.value = []
    localStorage.setItem(LS_PENDING_UPDATES, JSON.stringify([]))

    for (const update of updates) {
      try {
        if (update.type === 'markDone') {
          await markDailyUp(update.taskId)
        } else if (update.type === 'updateNotes') {
          await updateTask(update.taskId, { notes: update.notes })
        }
      } catch (err) {
        console.error('Failed to sync update to API:', update, err)
        // Re-queue failed updates
        pendingUpdates.value.push(update)
      }
    }

    // Save any re-queued updates
    if (pendingUpdates.value.length) {
      localStorage.setItem(LS_PENDING_UPDATES, JSON.stringify(pendingUpdates.value))
    }

    // Refresh from API to get latest state
    if (updates.length > 0) {
      await refreshAll()
    }
  }

  function lifeAreaFromTags(tags) {
    const priority = ['Love','Family','Health','Wealth','Home','Growth','Legacy','Play']
    if (!tags) return 'Uncategorized'
    // tags may be array of objects or strings; map id strings via tagMap when possible
    const names = tags.map(t => {
      if (typeof t === 'string') return tagMap.value[t] || t
      return (t && (t.name || t.text || t.label)) || ''
    }).filter(Boolean)
    // return a known life-area if present
    for (const p of priority) if (names.map(n=>n.toLowerCase()).includes(p.toLowerCase())) return p
    // otherwise, if we have any tag names, return the first tag name instead of 'Uncategorized'
    if (names.length) return names[0]
    return 'Uncategorized'
  }

  const availableTags = computed(() => {
    const seen = new Map()
    for (const t of tasks.value) {
      const tagsArr = t.tags || []
      for (const tg of tagsArr) {
        let name = null
        if (typeof tg === 'string') {
          // tg might be id; map to name if possible
          name = tagMap.value[tg] || tg
        } else if (tg && (tg.name || tg.text)) name = tg.name || tg.text
        else if (tg && tg.id) name = tagMap.value[tg.id] || tg.id
        if (!name) continue
        seen.set(name, name)
      }
    }
    return Array.from(seen.keys()).sort()
  })

  function toggleTag(name) {
    const idx = selectedTags.value.indexOf(name)
    if (idx === -1) selectedTags.value.push(name)
    else selectedTags.value.splice(idx, 1)
  }

  function setCompletionFilter(v) { completionFilter.value = v }

  function matchesFilters(task) {
    // tag filter
    const sel = selectedTags.value || []
    if (sel.length) {
      const names = getTagNames(task) || []
      if (!names.some(n => sel.includes(n))) return false
    }
    // completion filter
    if (completionFilter.value === 'done') {
      if (!task.completed) return false
    } else if (completionFilter.value === 'not-done') {
      if (task.completed) return false
    }
    return true
  }

  function clearSelectedTags() { selectedTags.value = [] }

  function getTagNames(task) {
    const tagsArr = task.tags || []
    const names = []
    for (const tg of tagsArr) {
      if (typeof tg === 'string') {
        // map id -> name if available
        names.push(tagMap.value[tg] || tg)
      } else if (tg && (tg.name || tg.text)) names.push(tg.name || tg.text)
      else if (tg && tg.id) names.push(tagMap.value[tg.id] || tg.id)
    }
    return names
  }

  function recurrence(task) {
    const freq = task.frequency || ''
    const everyX = task.everyX !== undefined ? Number(task.everyX) : 1
    if (freq === 'daily') return 'daily'
    if (freq === 'weekly') return 'weekly'
    if (freq === 'yearly') return 'yearly'
    if (freq === 'monthly') {
      if (everyX === 3) return 'quarterly'
      if (everyX === 12) return 'yearly'
      if (everyX === 1) return 'monthly'
      // Handle other monthly intervals
      if (everyX > 1 && everyX < 3) return 'monthly'
      if (everyX > 3 && everyX < 12) return 'quarterly' // treat 4-11 months as quarterly
    }
    return 'other'
  }

  function recurrencePriority(r) {
    if (r === 'daily') return 0
    if (r === 'weekly') return 1
    if (r === 'monthly') return 2
    if (r === 'quarterly') return 3
    if (r === 'yearly') return 4
    return 5
  }

  function sortTasksByRecurrenceAndDue(arr) {
    return (arr || []).slice().sort((a, b) => {
      const ra = recurrence(a)
      const rb = recurrence(b)
      const pa = recurrencePriority(ra)
      const pb = recurrencePriority(rb)
      if (pa !== pb) return pa - pb
      const da = parseNextDue(a)
      const db = parseNextDue(b)
      if (da && db) {
        if (da.isBefore(db)) return -1
        if (da.isAfter(db)) return 1
      } else if (da && !db) return -1
      else if (!da && db) return 1
      return (a.text || '').localeCompare(b.text || '')
    })
  }

  function parseNextDue(task) {
    // Habitica may provide: nextDue (string or array), date, due, nextDueDate
    let cand = null
    if (!task) return null
    if (task.nextDue) {
      // could be array or string
      if (Array.isArray(task.nextDue) && task.nextDue.length) cand = task.nextDue[0]
      else cand = task.nextDue
    }
    cand = cand || task.date || task.nextDueDate || task.due || null
    if (!cand) return null
    try {
      return dayjs(cand)
    } catch (e) {
      return null
    }
  }

  const headerStats = computed(() => {
    if (!user.value) return null
    const level = user.value.stats ? user.value.stats.lvl : null
    const xp = user.value.stats ? user.value.stats.exp : null
    const maxXp = user.value.stats ? (user.value.stats.toNextLevel || 100) : 100
    const hp = user.value.stats ? user.value.stats.hp : null
    const gold = user.value.balance ? (user.value.balance.toFixed ? user.value.balance.toFixed(2) : user.value.balance) : null
    return { level, xp, maxXp, hp, gold }
  })

  function dueTodayCount() {
    const today = dayjs()
    return tasks.value.filter(t=>{
      if (t.isDue !== undefined) return t.isDue
      const nd = parseNextDue(t)
      return nd ? nd.isSame(today, 'day') : false
    }).length
  }

  function tasksDueToday() {
    const today = dayjs()
    const list = tasks.value.filter(t=>{
      if (t.isDue !== undefined) return t.isDue
      const nd = parseNextDue(t)
      return nd ? nd.isSame(today, 'day') : false
    })
    return sortTasksByRecurrenceAndDue(list)
  }

  function upcomingTasks() {
    const now = dayjs()
    const list = tasks.value.filter(t=>{
      // Exclude daily tasks from upcoming
      if (recurrence(t) === 'daily') return false
      const nd = parseNextDue(t)
      if (!nd) return false
      const diff = nd.diff(now, 'day')
      // include tasks that are in the future (not today), up to 1 year (365 days)
      return diff > 0 && diff <= 365
    })
    return sortTasksByRecurrenceAndDue(list)
  }

  function missedTasks() {
    const now = dayjs()
    const list = tasks.value.filter(t=>{
      const nd = parseNextDue(t)
      if (!nd) return false
      return nd.isBefore(now, 'day')
    })
    return sortTasksByRecurrenceAndDue(list)
  }

  function completedHistory() {
    // aggregate counts by life area from task history entries
    const agg = {}
    for (const t of tasks.value) {
      const life = lifeAreaFromTags(t.tags || [])
      const hist = Array.isArray(t.history) ? t.history : (Array.isArray(t.completedHistory) ? t.completedHistory : [])
      const count = hist.length || 0
      agg[life] = (agg[life] || 0) + count
    }
    return agg
  }

  function completedLog(limit = 100) {
    // Build an ordered list of completion entries from tasks' history arrays if available.
    const entries = []
    for (const t of tasks.value) {
      const hist = Array.isArray(t.history) ? t.history : (Array.isArray(t.completedHistory) ? t.completedHistory : [])
      const life = lifeAreaFromTags(t.tags || [])
      for (const h of hist) {
        // history entries may be ISO strings or objects with date fields
        let date = null
        if (typeof h === 'string') date = dayjs(h)
        else if (h && (h.date || h.completedDate || h.timestamp)) date = dayjs(h.date || h.completedDate || h.timestamp)
        else continue
        if (!date.isValid()) continue
        entries.push({ date: date.toISOString(), life, text: t.text || '(no title)' })
      }
    }
    // sort desc
    entries.sort((a,b)=> new Date(b.date) - new Date(a.date))
    return entries.slice(0, limit)
  }

  function setToast(msg, timeout = 3000) {
    toastMessage.value = msg
    if (toastTimer.value) clearTimeout(toastTimer.value)
    toastTimer.value = setTimeout(()=>{ toastMessage.value = '' }, timeout)
  }

  // Load pending updates on store init
  try {
    const pending = localStorage.getItem(LS_PENDING_UPDATES)
    if (pending) {
      pendingUpdates.value = JSON.parse(pending)
      // Process any pending updates from previous session
      if (pendingUpdates.value.length) {
        setTimeout(() => processPendingUpdates(), 2000)
      }
    }
  } catch (e) {
    console.error('Failed to load pending updates', e)
  }

  return {
    userId, apiKey, user, tasks, loading,
    setUserId, setApiKey, hasCreds,
    refreshAll, markDone, updateTaskNotes,
    lifeAreaFromTags, recurrence, parseNextDue,
    headerStats, dueTodayCount, tasksDueToday, upcomingTasks, missedTasks, completedHistory
    , completedLog, setToast, toastMessage,
    selectedTags, toggleTag, clearSelectedTags, availableTags, getTagNames,
    completionFilter, setCompletionFilter, matchesFilters, processPendingUpdates
  }
})

