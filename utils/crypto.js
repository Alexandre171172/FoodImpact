/**
 * Password hashing using PBKDF2-SHA512 via Web Crypto API.
 * 600 000 iterations — resistant to brute force even in localStorage.
 * Format stored: $pbkdf2-sha512$600000$<salt_b64>$<hash_b64>
 */

export async function hashPassword(password) {
  const enc     = new TextEncoder()
  const salt    = crypto.getRandomValues(new Uint8Array(32))
  const keyMat  = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits    = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 600_000, hash: 'SHA-512' },
    keyMat, 512
  )
  const toB64   = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
  return `$pbkdf2-sha512$600000$${toB64(salt)}$${toB64(bits)}`
}

export async function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('$pbkdf2-sha512$')) return false
  try {
    const parts = stored.split('$').filter(Boolean) // ['pbkdf2-sha512','600000','salt','hash']
    const iters = parseInt(parts[1])
    const salt  = Uint8Array.from(atob(parts[2]), c => c.charCodeAt(0))
    const enc   = new TextEncoder()
    const keyMat = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
    )
    const bits  = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: iters, hash: 'SHA-512' },
      keyMat, 512
    )
    const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
    return toB64(bits) === parts[3]
  } catch {
    return false
  }
}

/** Decode Google / Apple JWT without verification (client-side info only) */
export function decodeJWT(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(b64))
  } catch {
    return null
  }
}
