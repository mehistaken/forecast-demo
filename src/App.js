import './App.css';
import { useEffect, useState } from 'react';
import ReactEcharts from "echarts-for-react"; 

function App() {
  const cityGeo = {
    "Toronto"    : { lat: 43.70011, lng: -79.4163   },
    "Ottawa"     : { lat: 45.41117, lng: -75.69812  },
    "Montreal"   : { lat: 45.50884, lng: -73.58781  },
    "Quebec city": { lat: 46.8131,  lng: -71.2075   },
    "Vancouver"  : { lat: 49.24966, lng: -123.11934 }
  };
  const apiUrl = "https://api.open-meteo.com/v1/forecast";
  const forecastDays = 7; // api support: 1, 3, 7 (default), 14, 16

  const [currentCity, setCurrentCity] = useState("");
  const [rowHeader, setRowHeader] = useState("");
  const [rowData, setRowData] = useState("");
  const [options, setOptions] = useState({});

  const ls = window.localStorage;
  const tmpUnit = '°C';
  const dayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const baseOptions = {
    grid: {
      left: '0',
      right: '0',
      bottom: '0',
      top: '15px',
      containLabel: true
    }    
  };

  // load default city if set
  useEffect(() => {
    if (!!ls && ls.getItem('defaultCity') !== null) {
      setCurrentCity(ls.getItem('defaultCity'));
    } else {
      setCurrentCity("Toronto");
    }
  }, []);

  // fetch data on city change
  useEffect(() => {
    if (!!currentCity) fetchWeatherData();
  }, [currentCity]);

  var fetchWeatherData = () => {
    var fetchURL = apiUrl + 
      '?latitude='  + cityGeo[currentCity].lat +
      '&longitude=' + cityGeo[currentCity].lng + 
      (forecastDays !== 7 ? '&forecast_days=' + forecastDays : '') +
      '&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_mean&timezone=auto';

    fetch(fetchURL).then(res => {
      return res.json();
    }).then(data => {
      if (!!data) {
        let header = [],
          headerLabel = [],
          body = [],
          daysMin = [],
          daysMax = [],
          daysMinLabel = [],
          daysMaxLabel = [],
          weekMin = null,
          weekMax = null;

        // tabular display
        for (let i = 0; i < forecastDays; i++) {
          header.push(<th key={i}>{data.daily.time[i]} ({dayOfWeek[new Date(data.daily.time[i]).getDay()].substr(0, 3)})</th>);
          headerLabel.push(data.daily.time[i]);
          let dayMin = data.daily.temperature_2m_min[i],
            dayMax = data.daily.temperature_2m_max[i];

          weekMin = !weekMin || dayMin < weekMin ? dayMin : weekMin;
          weekMax = !weekMax || dayMax > weekMax ? dayMax : weekMax;
          
          daysMin.push(dayMin);
          daysMax.push(dayMax - dayMin);
          daysMinLabel.push(dayMin);
          daysMaxLabel.push(dayMax);

          let strTemp = `${dayMin}${tmpUnit} - ${dayMax}${tmpUnit}`;

          let bodycell = <td key={i}>{strTemp}</td>;
          body.push(bodycell);
        }
        setRowHeader(header);
        setRowData(body);

        // bars
        setOptions({
          xAxis: {
            show: false,
            type: 'category',
            // data: headerLabel,
            // axisTick: {
            //   show: false
            // }
          },
          yAxis: {
            scale: true,
            axisLine: {
              show: false
            },
            axisLabel: {
              show: false
            }
          },
          series: [
            {
              name: 'placeholder',
              type: 'bar',
              stack: 'Day',
              silent: true,
              itemStyle: {
                borderColor: 'transparent',
                color: 'transparent'
              },
              emphasis: {
                itemStyle: {
                  borderColor: 'transparent',
                  color: 'transparent'
                }
              },
              label: {
                show: true,
                position: 'insideTop',
                offset: [0, 3],
                color: '#16161d',
                formatter: '{c}' + tmpUnit
              },
              data: daysMin
            },
            {
              name: 'Range',
              type: 'bar',
              stack: 'Day',
              barWidth: 40,
              label: {
                show: true,
                position: 'top',
                color: '#16161d',
                formatter: function(param) {
                  return daysMaxLabel[param.dataIndex] + tmpUnit
                }
              },
              data: daysMax
            },
          ],
          ... baseOptions
        });
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
          <tr>{rowHeader}</tr>
        </thead>
        <tbody>
          <tr>{rowData}</tr>
          <tr>
            <td colSpan={forecastDays}>
              <ReactEcharts option={options} style={{ width: '100%', height: '600px' }} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
