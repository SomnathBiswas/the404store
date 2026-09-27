/**
 * Simple in-memory rate limiter for API endpoints
 * In production, consider using Redis-based rate limiting
 */

const rateLimitMap = new Map()

/**
 * Check if a request should be rate limited
 * @param {string} identifier - Unique identifier (IP address, email, etc.)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(identifier, maxRequests = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Get existing requests for this identifier
  let requests = rateLimitMap.get(identifier) || []
  
  // Filter out requests outside the time window
  requests = requests.filter(timestamp => timestamp > windowStart)
  
  // Check if limit exceeded
  if (requests.length >= maxRequests) {
    const oldestRequest = requests[0]
    const resetTime = oldestRequest + windowMs
    return {
      allowed: false,
      remaining: 0,
      resetTime
    }
  }
  
  // Add current request
  requests.push(now)
  rateLimitMap.set(identifier, requests)
  
  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, timestamps] of rateLimitMap.entries()) {
      const filtered = timestamps.filter(t => t > windowStart)
      if (filtered.length === 0) {
        rateLimitMap.delete(key)
      } else {
        rateLimitMap.set(key, filtered)
      }
    }
  }
  
  return {
    allowed: true,
    remaining: maxRequests - requests.length,
    resetTime: now + windowMs
  }
}

/**
 * Extract client IP from request
 */
export function getClientIP(request) {
  // Try various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIP || 'unknown'
  return ip
}