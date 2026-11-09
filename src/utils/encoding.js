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
    // Restore base64 chars
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/')
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
    console.error('Decoding error:', e)
    return null
  }
}

// Generate a simple unique ID
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

// Build the survey URL from survey data
export function buildSurveyUrl(surveyData) {
  const encoded = encode(surveyData)
  const base = window.location.origin
  return `${base}/s#${encoded}`
}

// Build the admin URL from admin key
export function buildAdminUrl(adminKey) {
  const base = window.location.origin
  return `${base}/admin#${adminKey}`
}

// Extract encoded data from hash
export function getHashData() {
  const hash = window.location.hash.slice(1)
  if (!hash) return null
  return decode(hash)
}
