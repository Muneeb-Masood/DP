import React, { useEffect, useState } from 'react'
import { getBookingAnalytics } from '../Booking/bookingApi'
import './analytics.css'

export default function AnalyticsDashboard({ history }) {
    const [analytics, setAnalytics] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        getBookingAnalytics()
            .then((response) => {
                setAnalytics(response.data.analytics)
            })
            .catch(() => {
                setError('Unable to load analytics right now.')
            })
    }, [])

    const goToBooking = (e) => {
        e.preventDefault()
        history.push('/routes')
    }

    return (
        <div className='container analytics-page'>
            <div className='analytics-header'>
                <h2>SmartFleet Analytics Dashboard</h2>
                <button className='btn btn-primary' onClick={goToBooking}>Back To Booking</button>
            </div>

            {error && <p>{error}</p>}

            {analytics && (
                <>
                    <div className='analytics-grid'>
                        <div className='analytics-card'>
                            <h5>Total Bookings</h5>
                            <p>{analytics.totalBookings}</p>
                        </div>
                        <div className='analytics-card'>
                            <h5>Total Revenue</h5>
                            <p>PKR {analytics.totalRevenue}</p>
                        </div>
                        <div className='analytics-card'>
                            <h5>Most Popular Route</h5>
                            <p>{analytics.mostPopularRoute}</p>
                        </div>
                    </div>

                    <div className='analytics-table-wrap'>
                        <h5>Route Breakdown</h5>
                        <table className='table table-striped'>
                            <thead>
                                <tr>
                                    <th>Route</th>
                                    <th>Bookings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(analytics.routeBreakdown || {}).map((route) => (
                                    <tr key={route}>
                                        <td>{route}</td>
                                        <td>{analytics.routeBreakdown[route]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
