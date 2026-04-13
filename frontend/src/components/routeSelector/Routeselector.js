import React, { useState } from "react";
import "./Routeselector.css";
import * as apiCall from "./routeApifunc";
import BusList from "../BusList/BusList";
export default function Routeselector() {
  const [dataInp, setData] = useState([]);
  const [startCity, setStartCity] = useState("");
  const [destination, setDestination] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const cityOptions = [
    "Karachi",
    "Islamabad",
    "Lahore",
    "Faisalabad",
    "Hyderabad",
    "Peshawar",
    "Multan",
    "Rawalpindi",
    "Quetta",
  ];
  const handleToCity = (e) => {
    setDestination(e.target.value);
    localStorage.setItem("destination", e.target.value);
  };
  const renderBusList = (dataInp) => {
    if (dataInp.length > 0) {
      return <BusList value={dataInp} />;
    }

    if (hasSearched) {
      return <p className="mt-3">No buses found for selected route.</p>;
    }

    return null;
  };
  const handleFromCity = (e) => {
    setStartCity(e.target.value);
    localStorage.setItem("start", e.target.value);
  };

  const getRoutes = (e) => {
    e.preventDefault();

    if (!startCity || !destination) {
      setData([]);
      setHasSearched(true);
      return;
    }

    apiCall
      .getRoutesFromApi(startCity, destination)
      .then((response) => response.data)
      .then((data) => {
        setData(Array.isArray(data.bus) ? data.bus : []);
        setHasSearched(true);
      });
  };

  const handleDate = (e) => {
    e.preventDefault();
    //    console.log(e.target.value)
    localStorage.setItem("date", e.target.value);
  };

  return (
    <div className="rdc">
      <div className="form-group inline"></div>
      <div className="main-container">
        <form className="form-inline" onSubmit={(e) => getRoutes(e)}>
          <select
            name="fromCity"
            data-style="btn-new"
            className="selectpicker"
            value={startCity}
            onChange={(e) => {
              handleFromCity(e);
            }}
          >
            <option value="">FROM</option>
            {cityOptions.map((city) => (
              <option key={`from-${city}`} value={city}>
                {city}
              </option>
            ))}
          </select>
          <select
            name="toCity"
            data-style="btn-new"
            className="selectpicker"
            value={destination}
            onChange={(e) => {
              handleToCity(e);
            }}
          >
            <option value="">TO</option>
            {cityOptions.map((city) => (
              <option key={`to-${city}`} value={city}>
                {city}
              </option>
            ))}
          </select>
          <input
            onChange={(e) => {
              handleDate(e);
            }}
            type="date"
          ></input>
          <input type="submit" className=" btn btn-primary btn-md getRoute" />
        </form>

        <div>{renderBusList(dataInp)}</div>
      </div>
    </div>
  );
}
