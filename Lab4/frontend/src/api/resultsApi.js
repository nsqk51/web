import { http } from './http'

export function fetchResults() {
    return http('/api/results')
}

export function checkPoint(x, y, r) {
    return http('/api/results/check', {
        method: 'POST',
        body: JSON.stringify({ x, y, r })
    })
}