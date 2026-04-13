import React from 'react'
import QRCode from 'qrcode'
import './TicketPage.css'

export default function TicketPage({ history }) {
    const ticketRef = React.useRef(null)
    const [qrImage, setQrImage] = React.useState('')

    const handleSignOut = e => {
        e.preventDefault()
        sessionStorage.removeItem('authToken')
        localStorage.clear()
        history.push('/')
    }

    const handleBookAgainIcon = e => {
        e.preventDefault()
        history.push('/routes')
    }

    const handleDownloadPdf = async () => {
        if (!ticketRef.current) {
            return
        }

        const printWindow = window.open('', '_blank', 'width=900,height=700')

        if (!printWindow) {
            return
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Ticket ${booking?.id || busId || 'smartfleet'}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 24px;
                            color: #334155;
                        }
                        .ticket-print {
                            max-width: 720px;
                            margin: 0 auto;
                            border: 1px solid #d7dde5;
                            border-radius: 14px;
                            padding: 20px;
                        }
                        .ticket-print h2, .ticket-print h3 {
                            margin: 0 0 12px;
                        }
                        .row {
                            display: flex;
                            gap: 16px;
                            flex-wrap: wrap;
                        }
                        .col {
                            flex: 1;
                            min-width: 240px;
                        }
                        .qr {
                            text-align: center;
                            margin-top: 18px;
                        }
                        .meta {
                            margin-bottom: 10px;
                        }
                        .label {
                            font-weight: 700;
                            color: #0f172a;
                        }
                        .value {
                            margin-left: 6px;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            .ticket-print {
                                border: none;
                                border-radius: 0;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="ticket-print">
                        ${ticketRef.current.innerHTML}
                    </div>
                </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
    }

    const getBookingData = () => {
        const bookingData = localStorage.getItem('bookingData')
        return bookingData ? JSON.parse(bookingData) : null
    }

    const booking = getBookingData()
    const names = JSON.parse(localStorage.getItem('nameData') || '[]')
    const seats = JSON.parse(localStorage.getItem('reservedSeats') || '[]')
    const busId = localStorage.getItem('selectedBusId')
    const storedPaymentData = (() => {
        const paymentData = localStorage.getItem('paymentData')
        if (!paymentData) {
            return null
        }

        try {
            return JSON.parse(paymentData)
        } catch (error) {
            return null
        }
    })()
    const qrPayload = JSON.stringify({
        bookingId: booking?.id || busId,
        passenger: names[0] || booking?.passengerName || 'Passenger',
        route: `${localStorage.getItem('start') || ''} -> ${localStorage.getItem('destination') || ''}`,
        seats,
        payment: booking?.payment?.provider || storedPaymentData?.provider || 'Credit Card',
        fare: booking?.ticket?.payableTotal || booking?.ticket?.totalFare || 0,
    })

    React.useEffect(() => {
        let isMounted = true

        QRCode.toDataURL(qrPayload, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 220,
        }).then((url) => {
            if (isMounted) {
                setQrImage(url)
            }
        }).catch(() => {
            if (isMounted) {
                setQrImage('')
            }
        })

        return () => {
            isMounted = false
        }
    }, [qrPayload])

    return (
        <div className="container">
            <div>
                <nav className="mb-4 navbar navbar-expand-lg navbar-dark bg-unique hm-gradient">
                    <a href="/#" className="navbar-brand Company-Log">UT</a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent-3" aria-controls="navbarSupportedContent-3" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent-3">
                        <ul className="navbar-nav ml-auto nav-flex-icons ic">
                            <li className="nav-item">
                                <a href="/#" className="nav-link waves-effect waves-light" onClick={handleBookAgainIcon}>Book Again</a>
                            </li>
                            <li className="nav-item">
                                <a href="/#" className="nav-link waves-effect waves-light" onClick={handleSignOut}>Sign-Out</a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>

            <div className="tpMain">
                <div className="ticket-actions">
                    <button className="btn btn-primary ticket-download" onClick={handleDownloadPdf}>Download Ticket PDF</button>
                </div>
                <article className="ticket" ref={ticketRef}>
                    <header className="ticket__wrapper">
                        <div className="ticket__header">UNIQUE TRAVELS</div>
                    </header>
                    <div className="ticket__divider">
                        <div className="ticket__notch"></div>
                        <div className="ticket__notch ticket__notch--right"></div>
                    </div>
                    <div className="ticket__body">
                        <section className="ticket__section">
                            <h3>Journey</h3>
                            <p>From: {localStorage.getItem('start')}</p>
                            <p>To: {localStorage.getItem('destination')}</p>
                            <p>Date: {localStorage.getItem('date')}</p>
                        </section>

                        <section className="ticket__section">
                            <h3>Passengers</h3>
                            {names.map((name, idx) => <p key={idx} className="names">{name}</p>)}
                        </section>

                        <section className="ticket__section">
                            <h3>Seats</h3>
                            {seats.map((seat, idx) => <p key={idx} className="seatNo">{seat}</p>)}
                        </section>

                        <section className="ticket__section">
                            <h3>Booking Summary</h3>
                            <p>Payment: {booking?.payment?.provider || 'Credit Card'}</p>
                            <p>Booking ID: {booking?.id || busId}</p>
                            <p>Fare: {booking?.ticket?.payableTotal || booking?.ticket?.totalFare || 'N/A'}</p>
                        </section>

                        <section className="ticket__section qr-section">
                            <h3>QR E-Ticket</h3>
                            <div className="qr-box">
                                {qrImage ? <img src={qrImage} alt="QR E-Ticket" className="qr-image" /> : <p>QR unavailable</p>}
                            </div>
                            <p className="qr-caption">Scan this code to verify the ticket at boarding.</p>
                        </section>
                    </div>
                    <footer className="ticket__footer">
                        <p>Transaction-ID</p>
                        <p className="idData">{booking?.id || busId}</p>
                    </footer>
                </article>
            </div>
        </div>
    )
}
