/**
 * CSRF Protection utilities
 * Generates and validates CSRF tokens for state-changing operations
 */

import crypto from 'crypto'

// In-memory store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map()

/**
 * Generate a CSRF token
 * @param {string} sessionId - Unique identifier for the session
 * @returns {string} CSRF token
 */
export function generateCSRFToken(sessionId) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  
  csrfTokens.set(token, {
    sessionId,
    expiresAt
  })
  
  // Clean up expired tokens periodically
  if (csrfTokens.size > 1000) {
    cleanupExpiredTokens()
  }
  
  return token
}

/**
 * Validate a CSRF token
 * @param {string} token - CSRF token to validate
 * @param {string} sessionId - Session identifier
 * @returns {boolean} True if valid
 */
export function validateCSRFToken(token, sessionId) {
  if (!token || !sessionId) return false
  
  const tokenData = csrfTokens.get(token)
  if (!tokenData) return false
  
  // Check if token has expired
  if (tokenData.expiresAt < Date.now()) {
    csrfTokens.delete(token)
    return false
  }
  
  // Check if session matches
  if (tokenData.sessionId !== sessionId) return false
  
  // Remove token after successful validation (one-time use)
  csrfTokens.delete(token)
  
  return true
}

/**
 * Extract CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request) {
  return request.headers.get('x-csrf-token') || request.headers.get('X-CSRF-Token')
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens() {
  const now = Date.now()
  for (const [token, data] of csrfTokens.entries()) {
    if (data.expiresAt < now) {
      csrfTokens.delete(token)
    }
  }
}

/**
 * Middleware to check CSRF protection
 * Can be skipped for GET requests and authenticated API calls with proper CORS
 */
export function requireCSRF(request, sessionId) {
  // Skip CSRF check for GET requests (they should be idempotent)
  if (request.method === 'GET') return true
  
  // Skip if user is authenticated with JWT (already protected)
  const token = request.headers.get('authorization') || request.headers.get('Authorization')
  if (token && token.startsWith('Bearer ')) return true
  
  // For unauthenticated state-changing operations, require CSRF
  const csrfToken = getCSRFTokenFromRequest(request)
  return validateCSRFToken(csrfToken, sessionId)
}