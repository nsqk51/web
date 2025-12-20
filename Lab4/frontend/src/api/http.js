// http.js
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

    // ДЕБАГ: посмотрим, есть ли токен
    console.log('HTTP request to:', path, 'Token exists:', !!token)

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
        // ДЕБАГ: посмотрим первые 10 символов токена
        console.log('Token prefix:', token.substring(0, 10) + '...')
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    })

    // ДЕБАГ: логируем статус ответа
    console.log('Response status:', res.status, res.statusText)

    if (!res.ok) {
        let message = `HTTP ${res.status}`
        try {
            const text = await res.text()
            if (text) message = text
        } catch (_) {}

        // ДЕБАГ: логируем полный текст ошибки
        console.error('HTTP error:', message)
        throw new Error(message)
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) return await res.json()
    return await res.text()
}