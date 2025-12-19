const API_BASE = 'http://localhost:33137'

export function getToken() {
    return localStorage.getItem('token')
}

export function setToken(token) {
    localStorage.setItem('token', token)
}

export function clearToken() {
    localStorage.removeItem('token')
}

export async function http(path, options = {}) {
    const token = getToken()
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    })

    if (!res.ok) {
        // Пытаемся прочитать текст ошибки от сервера
        let message = `HTTP ${res.status}`
        try {
            const text = await res.text()
            // Если сервер вернул JSON с ошибкой или просто текст
            if (text) message = text
        } catch (_) {}
        throw new Error(message)
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) return await res.json()
    return await res.text()
}