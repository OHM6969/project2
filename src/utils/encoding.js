import { deflate, inflate } from 'pako'

// Convert a JS object to a URL-safe compressed string
export function encode(obj) {
  try {
    const json = JSON.stringify(obj)
    const compressed = deflate(json)
    let binary = ''
    const len = compressed.length
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(compressed[i])
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  } catch (e) {
    console.error('Encoding error:', e)
    return null
  }
}

// Decode a URL-safe compressed string back to a JS object
export function decode(str) {
  try {
    if (!str) return null
    // Clean string from any leading/trailing prefixes
    let clean = str.trim()
    if (clean.includes('/s#')) clean = clean.split('/s#')[1]
    if (clean.includes('#')) clean = clean.split('#').pop()
    if (clean.includes('data=')) {
      const match = clean.match(/data=([^&]+)/)
      if (match) clean = match[1]
    }

    // Restore base64 chars
    let b64 = clean.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding
    while (b64.length % 4 !== 0) b64 += '='
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const json = inflate(bytes, { to: 'string' })
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

// Generate a random 6-digit numeric survey code (e.g. 849201)
export function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate a simple unique alphanumeric ID
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate admin secret key from survey data
export function generateAdminKey(surveyData) {
  const payload = {
    ...surveyData,
    _created: Date.now(),
    _secret: generateId(12)
  }
  return encode(payload)
}

// Encode a student response into a compact response code
export function encodeResponse(response) {
  return encode(response)
}

// Decode a student response code
export function decodeResponse(code) {
  return decode(code)
}

// Build the survey URL from survey data and code
export function buildSurveyUrl(surveyData, code) {
  const surveyCode = code || surveyData.code || generate6DigitCode()
  const payload = { ...surveyData, code: surveyCode }
  const encoded = encode(payload)
  const base = window.location.origin
  // Clean URL compatible with Vercel rewrites: /s#data=...&code=...
  return `${base}/s#data=${encoded}&code=${surveyCode}`
}

// Build the admin URL from admin key
export function buildAdminUrl(adminKey) {
  const base = window.location.origin
  return `${base}/admin#${adminKey}`
}

// Extract encoded data or 6-digit code from URL
export function getHashData() {
  const hash = window.location.hash.slice(1)
  const search = window.location.search

  // 1. Check hash
  if (hash) {
    // If hash contains data=
    if (hash.includes('data=')) {
      const match = hash.match(/data=([^&]+)/)
      if (match) {
        const decoded = decode(match[1])
        if (decoded && decoded.questions) return decoded
      }
    }

    // Try decoding hash directly
    const decoded = decode(hash)
    if (decoded && decoded.questions) return decoded

    // Check if hash is a 6-digit code
    const cleanHash = hash.replace(/^code=/, '').trim()
    if (/^\d{6}$/.test(cleanHash)) {
      return { _lookupCode: cleanHash }
    }
  }

  // 2. Check search parameters
  if (search) {
    const params = new URLSearchParams(search)
    if (params.get('data')) {
      const decoded = decode(params.get('data'))
      if (decoded && decoded.questions) return decoded
    }
    if (params.get('code')) {
      const code = params.get('code').trim()
      if (/^\d{6}$/.test(code)) {
        return { _lookupCode: code }
      }
    }
  }

  return null
}
