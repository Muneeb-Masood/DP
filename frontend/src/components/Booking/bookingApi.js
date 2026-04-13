import axios from 'axios'

export function createBooking(payload) {
    return axios.post('http://localhost:8080/booking/create', payload, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getFarePreview(payload) {
    return axios.post('http://localhost:8080/booking/fare-preview', payload, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getBookingAnalytics() {
    return axios.get('http://localhost:8080/booking/analytics')
}
