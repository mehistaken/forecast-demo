# forecast-demo

## The task:

Use one of the public APIs from the list below, build a dashboard to return the next week's forecast for the cities below, and present the daily temperatures in a bar chart. The user should be able to select/filter the city they want to see the data from.

APIs: https://github.com/public-apis/public-apis#weather
Note: any API is fine

### Cities:
- Toronto
- Ottawa
- Montreal
- Quebec city
- Vancouver

This is a free form exercise for the candidates to demonstrate their abilities and thought process. This only needs to work locally for this demo, and any tech/frameworks can be used. These choices would be the focus of the discussion in the interview. Optional ideas to make this stand out more:
- Experiment with other types of weather data (like precipitation) and other ways of visualizing it, focusing on user experience
- Experiment with ways to make the UI more attractive (e.g. animation, responsiveness)


## Further development ideas
**visual**
- live webcam (as background)
- map view of cities (radar images?)
- for day view, make line chart continuous throughout and zoom to specific section on day change

**functional**
- use location service/ip geolocation to determine closest city
- show more forecast days (if available)
- customizable data (show/hide different stats)
- add sunrise/sunset time to day view
- collect data on how often users click on individual day details (which ones? next day, coming weekend, etc) and optimize fetch query
- cache query results (or should the API be responsible for that?)
