import React, { useState, useEffect } from 'react'
import { FaAngleDoubleDown } from "react-icons/fa";
import './busList.css'
export default function BusList({ value: dataInp }) {

    const [selectedBusId, setSelectedBusId] = useState('')
    const [arrowDown, setArrowDown] = useState(false)

    useEffect(() => {
        setSelectedBusId('')
        setArrowDown(false)
    }, [dataInp])


    const handleSubmit = busId => {
        localStorage.setItem("selectedBusId", busId)
        setSelectedBusId(busId)
        setArrowDown(true)
    }


    const handleReset = () => {
        setSelectedBusId('')
        setArrowDown(false)
        localStorage.removeItem("selectedBusId")
    }


    const renderFunction = () => {
        return dataInp.map((bus, idx) => {
            const isSelected = selectedBusId === bus._id
            return (
                <div key={idx} className="card mt-5 buslist">
                    <div class="row ml-3">
                        <div class="col-6 col-sm-3 mt-2 font-weight-bold ">Brand</div>
                        <div class="col-6 col-sm-3 mt-2 font-weight-bold ">From</div>
                        <div class="col-6 col-sm-3 mt-2 font-weight-bold ">To</div>
                        <div class="col-6 col-sm-3 mt-2 font-weight-bold ">Price</div>

                        <div class="w-100 d-none d-md-block"></div>

                        <div class="col-6 col-sm-3 mb-4">{bus.companyName}</div>
                        <div class="col-6 col-sm-3 mb-4">{bus.startCity}</div>
                        <div class="col-6 col-sm-3 mb-4">{bus.destination}</div>
                        <div class="col-6 col-sm-3 mb-4">{bus.pricePerSeat}</div>
                        <div class="col-6 col-sm-4 mb-2 ml-0">
                            <button className={isSelected ? "btn btn-primary btn-md disabled" : "btn btn-primary btn-md"} onClick={() => { handleSubmit(bus._id) }} >Book Now</button>
                        </div>
                        <div class="col-6 col-sm-4 mb-2 ml-0">
                            {isSelected && (
                                <button type="button" className="btn btn-outline-danger btn-sm ml-2" onClick={handleReset}>Clear selection</button>
                            )}
                        </div>
                    </div>
                </div >
            )
        })

    }


    return (
        <div className="">
            {renderFunction()}
            <div className={arrowDown ? "activeArrow" : "nonActive"}>
                <FaAngleDoubleDown />
            </div>
        </div>

    )
}
