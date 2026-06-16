const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function parseError(res) {
  let detail = ''
  try {
    const data = await res.json()
    if (typeof data?.detail === 'string') detail = data.detail
    else if (Array.isArray(data?.detail)) detail = data.detail.map((d) => d?.msg).filter(Boolean).join(', ')
    else detail = JSON.stringify(data)
  } catch {
    try {
      detail = await res.text()
    } catch {
      detail = ''
    }
  }
  return detail || `HTTP ${res.status}`
}

export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const message = await parseError(res)
    throw new Error(message)
  }

  if (res.status === 204) return null
  return await res.json()
}

