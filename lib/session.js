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
