import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FaAngleDoubleDown } from 'react-icons/fa'
import './Tab.css'
import { getLockedSeats, lockSeat, unlockSeat } from './seatLockApi'

const defaultLockedSeats = ['1A', '2A', '2B', '3B', '4A', '5C', '6A', '7B', '7C', '8B', '9B', '9C']

const seatRows = [
    ['1A', '1B', '1C'],
    ['2A', '2B', '2C'],
    ['3A', '3B', '3C'],
    ['4A', '4B', '4C'],
    ['5A', '5B', '5C'],
    ['6A', '6B', '6C'],
    ['7A', '7B', '7C'],
    ['8A', '8B', '8C'],
    ['9A', '9B', '9C'],
    ['10A', '10B', '10C'],
]

export default function SeatSelection() {
    const [name, setName] = useState([])
    const [gender, setGender] = useState([])
    const [arrowDown, setArrowDown] = useState(false)
    const [seatNumber, setSeatnumber] = useState([])
    const [serverLockedSeats, setServerLockedSeats] = useState([])
    const seatNumberRef = useRef([])

    const busId = localStorage.getItem('selectedBusId')
    const lockerId = sessionStorage.getItem('authToken') || 'guest'

    const lockedSeatSet = useMemo(() => {
        return new Set([...defaultLockedSeats, ...serverLockedSeats])
    }, [serverLockedSeats])

    useEffect(() => {
        if (!busId) {
            return undefined
        }

        let isMounted = true

        getLockedSeats(busId)
            .then((response) => {
                if (!isMounted) {
                    return
                }

                setServerLockedSeats(response.data.lockedSeats || [])
            })
            .catch(() => {
                if (isMounted) {
                    setServerLockedSeats([])
                }
            })

        return () => {
            isMounted = false
            seatNumberRef.current.forEach((seatNo) => {
                unlockSeat({ busId, seatNo, releasedBy: lockerId })
            })
        }
    }, [busId])

    const handleGender = (e) => {
        const { value } = e.target
        setGender((prev) => prev.concat(value))
    }

    const handlePassengerName = (e) => {
        const value = e.target.value
        if (!value) {
            setName('name is required')
            return
        }

        setName((prev) => prev.concat(value))
    }

    const handleSeatToggle = (seatNo, checked) => {
        if (!busId) {
            return
        }

        if (checked) {
            lockSeat({ busId, seatNo, lockedBy: lockerId })
                .then((response) => {
                    if (response.data.success) {
                        setSeatnumber((prev) => {
                            const nextSeats = [...new Set([...prev, seatNo])]
                            seatNumberRef.current = nextSeats
                            return nextSeats
                        })
                        setServerLockedSeats((prev) => [...new Set([...prev, seatNo])])
                    }
                })
                .catch(() => {
                    // Seat is already locked or locking failed.
                })
            return
        }

        unlockSeat({ busId, seatNo, releasedBy: lockerId })
            .finally(() => {
                setSeatnumber((prev) => {
                    const nextSeats = prev.filter((seat) => seat !== seatNo)
                    seatNumberRef.current = nextSeats
                    return nextSeats
                })
                setServerLockedSeats((prev) => prev.filter((seat) => seat !== seatNo))
            })
    }

    const handleSubmitDetails = (e) => {
        e.preventDefault()
        setArrowDown(true)
        localStorage.setItem('reservedSeats', JSON.stringify(seatNumber))
        localStorage.setItem('nameData', JSON.stringify(name))
    }

    const renderPassengerData = (seatArray) => {
        return seatArray.map((seat, idx) => {
            return (
                <form key={idx} className="form seatfrm">
                    <p className="text-capitalize text-center">Seat No: {seat}</p>
                    <input
                        className="form-control seatInp"
                        onBlur={handlePassengerName}
                        type="text"
                        name="passenger-name"
                        placeholder="Enter Name"
                    />
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name={`gender-${seat}`}
                            id={`male-${seat}`}
                            value="Male"
                            onClick={handleGender}
                        />
                        <label className="form-check-label" htmlFor={`male-${seat}`}>Male</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name={`gender-${seat}`}
                            id={`female-${seat}`}
                            value="Female"
                            onClick={handleGender}
                        />
                        <label className="form-check-label" htmlFor={`female-${seat}`}>Female</label>
                    </div>
                </form>
            )
        })
    }

    return (
        <div className="ss">
            <div className="row">
                <div className="column1">
                    <div className="plane">
                        <div>
                            <ol className="cabin fuselage">
                                {seatRows.map((rowSeats, rowIndex) => (
                                    <li className={`row row--${rowIndex + 1}`} key={rowIndex}>
                                        <ol className="seats" type="A">
                                            {rowSeats.map((seatNo) => (
                                                <li className="seat" key={seatNo}>
                                                    <input
                                                        type="checkbox"
                                                        value={seatNo}
                                                        id={seatNo}
                                                        checked={seatNumber.includes(seatNo)}
                                                        disabled={lockedSeatSet.has(seatNo) && !seatNumber.includes(seatNo)}
                                                        onChange={(e) => handleSeatToggle(seatNo, e.target.checked)}
                                                    />
                                                    <label htmlFor={seatNo}>{seatNo}</label>
                                                </li>
                                            ))}
                                        </ol>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
                <div className="column2">
                    <div className="seatInfo">
                        <form className="form-group">
                            {renderPassengerData(seatNumber)}
                        </form>
                        <div>
                            <button onClick={handleSubmitDetails} className="btn btn-info seatBT">
                                Confirm Details
                            </button>
                        </div>
                        <div className={arrowDown ? 'activeArrow2' : 'nonActive'}>
                            <FaAngleDoubleDown />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
