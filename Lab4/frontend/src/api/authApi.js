import { http } from './http'

export function login(username, password) {
    return http('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    })
}

export function register(username, password) {
    return http('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    })
}