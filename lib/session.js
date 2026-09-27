// Simple client helpers for auth session + cart/wishlist persistence.
'use client'

export const getToken = () => (typeof window === 'undefined' ? null : window.localStorage.getItem('404-token'))
export const setToken = (t) => window.localStorage.setItem('404-token', t)
export const clearToken = () => window.localStorage.removeItem('404-token')

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(window.localStorage.getItem('404-user') || 'null') } catch { return null }
}
export const setStoredUser = (u) => window.localStorage.setItem('404-user', JSON.stringify(u))
export const clearStoredUser = () => window.localStorage.removeItem('404-user')

export const authFetch = async (url, options = {}) => {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(url, { ...options, headers })
}

export const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

// CSRF token helpers
export const getCSRFToken = () => {
  if (typeof window === 'undefined') return null
  try { return window.localStorage.getItem('404-csrf') || null } catch { return null }
}

export const setCSRFToken = (token) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('404-csrf', token)
}

export const clearCSRFToken = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem('404-csrf')
}

// Fetch CSRF token from server
export const fetchCSRFToken = async () => {
  try {
    const sessionId = Math.random().toString(36).substring(7)
    const response = await fetch(`/api/csrf/token?session=${sessionId}`)
    const data = await response.json()
    if (data.token) {
      setCSRFToken(data.token)
      return data.token
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
  }
  return null
}

// Authenticated fetch with CSRF protection
export const authFetchWithCSRF = async (url, options = {}) => {
  const token = getToken()
  const csrfToken = getCSRFToken()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken
  return fetch(url, { ...options, headers })
}
