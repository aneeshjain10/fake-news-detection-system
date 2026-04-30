export const AUTH_KEY = 'fnd_users'
export const SESSION_KEY = 'fnd_session'

export function getUsers() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || '{}')
  } catch { return {} }
}

export function saveUsers(users) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(users))
}

export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch { return null }
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function signup(name, email, password) {
  const users = getUsers()
  if (users[email]) return { error: 'Email already registered' }
  users[email] = { name, email, password, createdAt: new Date().toISOString() }
  saveUsers(users)
  const user = { name, email }
  setSession(user)
  return { user }
}

export function login(email, password) {
  const users = getUsers()
  const user = users[email]
  if (!user) return { error: 'Email not found' }
  if (user.password !== password) return { error: 'Incorrect password' }
  const session = { name: user.name, email }
  setSession(session)
  return { user: session }
}

export function getHistory() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('fnd_history') || '[]')
  } catch { return [] }
}

export function addToHistory(entry) {
  const history = getHistory()
  history.unshift({ ...entry, id: Date.now(), timestamp: new Date().toISOString() })
  localStorage.setItem('fnd_history', JSON.stringify(history.slice(0, 50)))
}
