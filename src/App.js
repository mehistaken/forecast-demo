import './App.css';
import { useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';

const cityGeo = {
  "Toronto"    : { lat: 43.70011, lng: -79.4163   },
  "Ottawa"     : { lat: 45.41117, lng: -75.69812  },
  "Montreal"   : { lat: 45.50884, lng: -73.58781  },
  "Quebec city": { lat: 46.8131,  lng: -71.2075   },
  "Vancouver"  : { lat: 49.24966, lng: -123.11934 }
};

const apiUrl = "https://api.open-meteo.com/v1/forecast";

function App() {
  const [currentCity, setCurrentCity] = useState("");
  const [tableHeader, setTableHeader] = useState("");
  const [tableBody, setTableBody] = useState("");
  const ls = window.localStorage;
  const tmpUnit = '°C';

  useEffect(() => {
    if (!!ls && ls.getItem('defaultCity') !== null) {
      setCurrentCity(ls.getItem('defaultCity'));
    } else {
      setCurrentCity("Toronto");
    }
  }, []);

  useEffect(() => {
    if (!!currentCity) fetchWeatherData();
  }, [currentCity]);

  var fetchWeatherData = () => {
    var fetchURL = apiUrl + 
      '?latitude='  + cityGeo[currentCity].lat +
      '&longitude=' + cityGeo[currentCity].lng + 
      '&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_mean&timezone=auto';

    fetch(fetchURL).then(response => {
      return response.json();
    }).then(data => {
      if (!!data) {
        let numDays = data.daily.time.length;
        setTableHeader(data.daily.time.map(day => <th key={day}>{day}</th>));
        let body = [];
        for (let i = 0; i < numDays; i++) {
          body.push(<td key={i}>{data.daily.temperature_2m_min[i] + tmpUnit + ' - ' + data.daily.temperature_2m_max[i] + tmpUnit}</td>);
        }
        setTableBody(body);
      }
    })
  }

  var setDefault = () => {
    if (!!ls) {
      ls.setItem('defaultCity', currentCity);
    }
  }

  var cityOptions = Object.keys(cityGeo).map((city) => {
    return <option value={city} key={city}>{city}</option>
  })

  const handleCityChange = e => {
    if (e.target.value !== currentCity) setCurrentCity(e.target.value);
  }

  return (
    <div className="App">
      Select city: <select id="city" onChange={handleCityChange} value={currentCity}>
        {cityOptions}
      </select> [<a href="#" onClick={setDefault}>Set as default city</a>]
      <h2>7 day forecast for {currentCity}</h2>
      <table>
        <thead>
          <tr>{tableHeader}</tr>
        </thead>
        <tbody>
          <tr>{tableBody}</tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
