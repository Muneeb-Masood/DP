import React from 'react'
import Card from 'react-credit-cards'
import './PaymentTab.css'
import jwt_decode from 'jwt-decode'
import { createBooking, getFarePreview } from '../Booking/bookingApi'
import {
    formatCreditCardNumber,
    formatCVC,
    formatExpirationDate
} from './utils'
import 'react-credit-cards/es/styles-compiled.css'

export default class App extends React.Component {
    state = {
        number: '',
        name: '',
        expiry: '',
        cvc: '',
        issuer: '',
        focused: '',
        paymentMethod: 'creditcard',
        isAC: true,
        hasFood: false,
        hasTV: false,
        seatType: 'Regular',
        bookingStatus: '',
        currentUser: '',
        fareBreakdown: null
    }

    componentDidMount() {
        const tok = sessionStorage.getItem('authToken')

        if (!tok) {
            return
        }

        try {
            const decoded = jwt_decode(tok)
            this.setState({ currentUser: decoded.email || decoded.user || '' })
        } catch (error) {
            this.setState({ currentUser: '' })
        }

        this.updateFarePreview()
    }

    handleCallback = ({ issuer }, isValid) => {
        if (isValid) {
            this.setState({ issuer })
        }
    }

    handleInputFocus = ({ target }) => {
        this.setState({ focused: target.name })
    }

    handleInputChange = ({ target }) => {
        if (target.name === 'number') {
            target.value = formatCreditCardNumber(target.value)
        } else if (target.name === 'expiry') {
            target.value = formatExpirationDate(target.value)
        } else if (target.name === 'cvc') {
            target.value = formatCVC(target.value)
        }

        this.setState({ [target.name]: target.value })
    }

    handleOptionChange = ({ target }) => {
        const value = target.type === 'checkbox' ? target.checked : target.value
        this.setState({ [target.name]: value }, () => this.updateFarePreview())
    }

    updateFarePreview = async () => {
        const selectedBusId = localStorage.getItem('selectedBusId')

        if (!selectedBusId) {
            return
        }

        try {
            const response = await getFarePreview({
                busId: selectedBusId,
                ticketOptions: {
                    isAC: this.state.isAC,
                    hasFood: this.state.hasFood,
                    hasTV: this.state.hasTV,
                    seatType: this.state.seatType
                }
            })

            this.setState({ fareBreakdown: response.data.fare })
        } catch (error) {
            this.setState({ fareBreakdown: null })
        }
    }

    renderNamesOfPassenger = () => {
        const passArray = localStorage.getItem('nameData')

        if (!passArray) {
            return null
        }

        const nameArray = JSON.parse(passArray)
        return nameArray.map((name, idx) => <p key={idx}>{name}</p>)
    }

    renderSeatNumbers = () => {
        const seatArray = localStorage.getItem('reservedSeats')

        if (!seatArray) {
            return null
        }

        const seaArr = JSON.parse(seatArray)
        return seaArr.map((seat, idx) => <p key={idx}>{seat}</p>)
    }

    createBooking = async () => {
        const selectedBusId = localStorage.getItem('selectedBusId')
        const passengerNames = localStorage.getItem('nameData')
        const passengerList = passengerNames ? JSON.parse(passengerNames) : []

        if (!selectedBusId) {
            this.setState({ bookingStatus: 'Please select a bus first.' })
            return
        }

        if (passengerList.length === 0) {
            this.setState({ bookingStatus: 'Please add passenger details first.' })
            return
        }

        try {
            this.setState({ bookingStatus: 'Creating booking...' })
            const response = await createBooking({
                busId: selectedBusId,
                passengerName: passengerList[0],
                paymentMethod: this.state.paymentMethod,
                ticketOptions: {
                    isAC: this.state.isAC,
                    hasFood: this.state.hasFood,
                    hasTV: this.state.hasTV,
                    seatType: this.state.seatType
                }
            })

            localStorage.setItem('bookingData', JSON.stringify(response.data.booking))
            localStorage.setItem('paymentData', JSON.stringify(response.data.booking.payment))
            this.setState({ bookingStatus: 'Booking created successfully.' })
            window.location.href = '/getTicket'
        } catch (error) {
            const message = error.response?.data?.message || 'Booking could not be created.'
            this.setState({ bookingStatus: message })
        }
    }

    render() {
        const { number, name, expiry, cvc, focused, issuer, paymentMethod, isAC, hasFood, hasTV, seatType, bookingStatus, currentUser, fareBreakdown } = this.state

        return (
            <div className='paym'>
                <div className='row'>
                    <div key='Payment'>
                        <div className='App-payment cl-1'>
                            <p className='pPayment'>Enter Credit card details</p>
                            <Card
                                number={number}
                                name={name}
                                expiry={expiry}
                                cvc={cvc}
                                focused={focused}
                                callback={this.handleCallback}
                            />
                            <form className='credit-form' onSubmit={(e) => e.preventDefault()}>
                                <div className='form-group'>
                                    <input
                                        type='tel'
                                        name='number'
                                        className='frm-ctrl'
                                        placeholder='Card Number'
                                        pattern='[\d| ]{16,22}'
                                        required
                                        onChange={this.handleInputChange}
                                        onFocus={this.handleInputFocus}
                                    />
                                </div>
                                <div className='form-group'>
                                    <input
                                        type='text'
                                        name='name'
                                        className='frm-ctrl'
                                        placeholder='Name'
                                        required
                                        onChange={this.handleInputChange}
                                        onFocus={this.handleInputFocus}
                                    />
                                </div>
                                <div className='form-group'>
                                    <input
                                        type='tel'
                                        name='expiry'
                                        className='frm-ctrl'
                                        placeholder='Valid Thru'
                                        pattern='\d\d/\d\d'
                                        required
                                        onChange={this.handleInputChange}
                                        onFocus={this.handleInputFocus}
                                    />
                                </div>
                                <div className='form-group'>
                                    <input
                                        type='tel'
                                        name='cvc'
                                        className='frm-ctrl cvc'
                                        placeholder='CVC'
                                        pattern='\d{3,4}'
                                        required
                                        onChange={this.handleInputChange}
                                        onFocus={this.handleInputFocus}
                                    />
                                </div>
                                <input type='hidden' name='issuer' value={issuer} />

                                <div className='form-group actionButton'>
                                    <label htmlFor='paymentMethod'>Payment Method</label>
                                    <select id='paymentMethod' name='paymentMethod' className='frm-ctrl' value={paymentMethod} onChange={this.handleOptionChange}>
                                        <option value='creditcard'>Credit Card</option>
                                        <option value='jazzcash'>JazzCash</option>
                                        <option value='easypaisa'>EasyPaisa</option>
                                    </select>
                                </div>

                                <div className='form-group actionButton'>
                                    <label className='mr-2'>
                                        <input type='checkbox' name='isAC' checked={isAC} onChange={this.handleOptionChange} /> AC
                                    </label>
                                    <label className='mr-2'>
                                        <input type='checkbox' name='hasFood' checked={hasFood} onChange={this.handleOptionChange} /> Food
                                    </label>
                                    <label>
                                        <input type='checkbox' name='hasTV' checked={hasTV} onChange={this.handleOptionChange} /> TV
                                    </label>
                                    <select name='seatType' className='frm-ctrl mt-2' value={seatType} onChange={this.handleOptionChange}>
                                        <option value='Regular'>Regular Seat</option>
                                        <option value='Window'>Window Seat</option>
                                        <option value='Aisle'>Aisle Seat</option>
                                        <option value='Sleeper'>Sleeper Seat</option>
                                    </select>
                                </div>

                                <div className='actionButton'>
                                    <button type='button' onClick={this.createBooking} className='btn btn-light btCustom'>
                                        PAY
                                    </button>
                                </div>
                            </form>
                            <p className='mt-2'>{bookingStatus}</p>
                        </div>
                    </div>

                    <div className='columnTwo'>
                        <h3>Unique Travels</h3>
                        <div>
                            <p>BOOKING DETAILS</p>
                            <div className='row'>
                                <div className='col-6 pt'>
                                    <p className='hdng'>Username</p>
                                    <hr className='hr3' />
                                    <p className='hdng'>Date</p>
                                    <p className='hdng'>From</p>
                                    <p className='hdng'>To</p>
                                    <hr className='hr3' />
                                    <p className='hdng'>Passengers</p>
                                    {this.renderNamesOfPassenger()}
                                    <hr className='hr3' />
                                    <p className='hdng'>Ticket price</p>
                                    <p className='hdng'>Tax</p>
                                    <p className='hdng'>Total Sum</p>
                                    <p className='hdng'>Payment Method</p>
                                </div>
                                <div className='col-6'>
                                    <hr className='hr3' />
                                    <p className='usrName'>{currentUser}</p>
                                    <p className='usrName'>{localStorage.getItem('date')}</p>
                                    <p className='usrName'>{localStorage.getItem('start')}</p>
                                    <p className='usrName'>{localStorage.getItem('destination')}</p>
                                    <hr className='hr3' />
                                    <p className='hdng'>Seat No</p>
                                    {this.renderSeatNumbers()}
                                    <hr className='hr3' />
                                    <p className='usrName'>PKR {fareBreakdown?.totalFare ?? 0}</p>
                                    <p className='usrName'>PKR {fareBreakdown?.tax ?? 0}</p>
                                    <p className='usrName'>PKR {fareBreakdown?.payableTotal ?? 0}</p>
                                    <p className='usrName'>{paymentMethod}</p>
                                    {fareBreakdown && (
                                        <div className='mt-2 pricing-box'>
                                            <hr className='hr3' />
                                            <p className='hdng'>Pricing Breakdown</p>
                                            <p>Base Fare: PKR {fareBreakdown.baseFare}</p>
                                            <p>Dynamic Base ({fareBreakdown.timeMode}): PKR {fareBreakdown.adjustedBaseFare}</p>
                                            <p>AC: PKR {fareBreakdown.options?.acCharge || 0}</p>
                                            <p>Food: PKR {fareBreakdown.options?.foodCharge || 0}</p>
                                            <p>TV: PKR {fareBreakdown.options?.tvCharge || 0}</p>
                                            <p>Seat Type: PKR {fareBreakdown.options?.seatTypeSurcharge || 0}</p>
                                            <p>Add-ons Total: PKR {fareBreakdown.addonTotal}</p>
                                            <p>Subtotal: PKR {fareBreakdown.totalFare}</p>
                                            <p>Tax: PKR {fareBreakdown.tax}</p>
                                            <p className='pricing-total'>Final Payable: PKR {fareBreakdown.payableTotal}</p>
                                            <small>
                                                Time x{fareBreakdown.timeMultiplier}, Demand x{fareBreakdown.demandMultiplier}, Type x{fareBreakdown.busTypeMultiplier}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}