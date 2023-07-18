import './App.css';
import './fa/fontawesome.min.css';
import './fa/solid.min.css';
import { useRef, useEffect, useState, useCallback } from 'react';
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
  // const [weatherData, setWeatherData] = useState({});
  const [rowHeader, setRowHeader] = useState("");
  const [rowData, setRowData] = useState("");
  const [options, setOptions] = useState({});

  const weatherData = useRef(null);
  const weekOptions = useRef(null);

  const chartRef = useRef();

  const ls = window.localStorage;
  const tmpUnit = '°C';
  const dayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const wcIcon = {
    0: [<i className="fas fa-sun"></i>, 'Clear sky'],

    1: [<i className="fas fa-sun-cloud"></i>, 'Mainly clear'],
    2: [<i className="fas fa-clouds-sun"></i>, 'Partly cloudy'],
    3: [<i className="fas fa-clouds"></i>, 'Overcast'],

    45: [<i className="fas fa-fog"></i>, 'Fog'],
    48: [<i className="fas fa-fog"></i>, 'Fog'],

    51: [<i className="fas fa-cloud-drizzle"></i>, 'Light drizzle'],
    53: [<i className="fas fa-cloud-drizzle"></i>, 'Moderate drizzle'],
    55: [<i className="fas fa-cloud-drizzle"></i>, 'Heavy drizzle'],

    61: [<i className="fas fa-cloud-showers"></i>, 'Light rain'],
    63: [<i className="fas fa-cloud-showers"></i>, 'Moderate rain'],
    65: [<i className="fas fa-cloud-showers"></i>, 'Heavy rain'],

    71: [<i className="fas fa-snowflake"></i>, 'Light snow'],
    73: [<i className="fas fa-snowflake"></i>, 'Moderate snow'],
    75: [<i className="fas fa-snowflake"></i>, 'Heavy snow'],

    80: [<i className="fas fa-cloud-sun-rain"></i>, 'Light showers'],
    81: [<i className="fas fa-cloud-sun-rain"></i>, 'Moderate showers'],
    82: [<i className="fas fa-cloud-sun-rain"></i>, 'Heavy showers'],

    95: [<i className="fas fa-thunderstorm"></i>, 'Thunderstorm'],
    96: [<i className="fas fa-thunderstorm"></i>, 'Thunderstorm'],
    99: [<i className="fas fa-thunderstorm"></i>, 'Thunderstorm']
  }

  // load default city if set
  useEffect(() => {
    if (!!ls && ls.getItem('defaultCity') !== null) {
      setCurrentCity(ls.getItem('defaultCity'));
    } else {
      setCurrentCity("Toronto");
    }

    window.addEventListener('resize', function() {
      chartRef.current?.resize();
    });
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
      '&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_mean' +
      '&hourly=temperature_2m,precipitation_probability' + 
      '&timezone=auto';

    fetch(fetchURL).then(res => {
      return res.json();
    }).then(data => {
      if (!!data) {
        weatherData.current = data;

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
          let today = new Date(data.daily.time[i]);
          header.push(<th key={i} onClick={e => dayClick(e, i)}>
            {i === 0 ? 'Today ' : (i === 1 ? 'Tomorrow ' : month[today.getMonth()].substring(0,3) + ' ' + today.getDate() + ' ')} 
             ({dayOfWeek[new Date(data.daily.time[i]).getDay()].substring(0, 3)})<br />
            <div className="icon">{wcIcon[data.daily.weathercode[i]][0]}<br />{wcIcon[data.daily.weathercode[i]][1]}</div>
          </th>);
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

        let dataOptions = {
          grid: {
            left: '0',
            right: '0',
            bottom: '0',
            top: '40px',
            containLabel: true
          },
          xAxis: {
            data: headerLabel,
            show: false,
            type: 'category'
          },
          yAxis: [
            {
              scale: true,
              axisTick: {
                show: false
              },
              axisLine: {
                show: false
              },
              axisLabel: {
                show: false
              },
              splitLine: {
                show: true
              }
            },
            {
              scale: true,
              axisTick: {
                show: false
              },
              axisLine: {
                show: false
              },
              axisLabel: {
                show: false
              },
              splitLine: {
                show: false
              }
            }
          ],
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
                fontSize: 16,
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
                fontSize: 16,
                color: '#16161d',
                formatter: function(param) {
                  return daysMaxLabel[param.dataIndex] + tmpUnit
                }
              },
              data: daysMax
            }
          ]
        };

        weekOptions.current = dataOptions;
        // bar chart options
        setOptions(dataOptions);
      }
    })
  }

  const setDefault = () => {
    if (!!ls) {
      ls.setItem('defaultCity', currentCity);
    }
  }

  const cityOptions = Object.keys(cityGeo).map((city) => {
    return <option value={city} key={city}>{city}</option>
  })

  const handleCityChange = e => {
    if (e.target.value !== currentCity) setCurrentCity(e.target.value);
  }

  const dayClick = (e, i) => {
    let cell = e.target.closest('th');
    let dayOptions = {};

    if (!cell.classList.contains('selected')) {
      for (let sibling of cell.parentNode.children){
        sibling.classList.remove('selected');
      }
      cell.classList.add('selected');

      let startIdx = i * 24,
        endIdx = (i + 1) * 24;

      let data = weatherData.current;
      let cat = data.hourly.time.slice(startIdx, endIdx).map(c => c.substr(c.indexOf('T') + 1)),
        temp = data.hourly.temperature_2m.slice(startIdx, endIdx),
        prec = data.hourly.precipitation_probability.slice(startIdx, endIdx);

      dayOptions = {
        grid: {
          left: '20',
          right: '20',
          bottom: '20',
          top: '40',
          containLabel: true
        },
        xAxis: {
          show: true,
          type: 'category',
          name: 'Time',
          nameLocation: 'middle',
          nameGap: 25,
          data: cat,
          axisLabel: {
            show: true
          },
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: [
          {
            name: 'Temperature ' + tmpUnit,
            type: 'value',
            nameRotate: 90,
            nameLocation: 'middle',
            nameGap: 25,
            scale: false,
            axisLabel: {
              show: true,
              color: 'red'
            },
            axisLine: {
              show: true
            },
            splitLine: {
              show: false
            }
          },
          {
            name: 'Precipitation %',
            type: 'value',
            nameLocation: 'middle',
            nameRotate: -90,
            nameGap: 25,
            min: 0,
            max: 100,
            axisLine: {
              show: true
            },
            axisTick: {
              show: true
            },
            axisLabel: {
              show: true,
              color: 'blue'
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: 'Temp',
            type: 'line',
            smooth: 0.3,
            data: temp,
            lineStyle: {
              color: 'red'
            },
            itemStyle: {
              opacity: '0'
            }
          },
          {
            name: 'Prec',
            type: 'line',
            smooth: 0.3,
            yAxisIndex: 1,
            data: prec,
            lineStyle: {
              color: 'blue'
            },
            itemStyle: {
              opacity: '0'
            }
          }
        ]
      };
      
    } else {

      // on deselect, revert to weekly bar graph
      cell.classList.remove('selected');
      dayOptions = weekOptions.current;
    }

    setOptions({ ... dayOptions });
  }

  return (
    <div className="App">
      Select city: <select id="city" onChange={handleCityChange} value={currentCity}>
        {cityOptions}
      </select> [<a href="#" onClick={e => setDefault}>Set as default city</a>]
      <h2>7 day forecast for {currentCity}</h2>
      <table className='flex'>
        <thead>
          <tr>{rowHeader}</tr>
        </thead>
        <tbody>
          {/* <tr>{rowData}</tr> */}
          <tr><td colSpan={forecastDays}><ReactEcharts ref={chartRef} option={options} style={{ width: '100%', height: '400px' }} /></td></tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
