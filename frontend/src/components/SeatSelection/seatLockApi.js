import axios from 'axios'

const BASE_URL = 'http://localhost:8080/seat-locks'

export function getLockedSeats(busId) {
    return axios.get(`${BASE_URL}/${busId}`)
}

export function lockSeat(payload) {
    return axios.post(`${BASE_URL}/lock`, payload, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function unlockSeat(payload) {
    return axios.delete(`${BASE_URL}/unlock`, {
        data: payload,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
