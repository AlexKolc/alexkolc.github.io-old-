let updateLocationForm = document.forms.namedItem('updateLocation');
let addNewCityForm = document.forms.namedItem('addNewCity');

updateLocationForm.addEventListener('click', (event) => {
    getLocation();
    event.preventDefault();
})

addNewCityForm.addEventListener('submit', (event) => {
    addNewCity();
    event.preventDefault();
})

function request(params) {
    params.push('units=metric');
    params.push('appid=52f8f9af79e0664f928042deb0e2b888');
    const url = 'https://api.openweathermap.org/data/2.5/weather?' + params.join('&');
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    return fetch(url, {signal: abortSignal}).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            alert('Cannot find this place');
        }
    }).catch(() => {
        alert('Connection was lost');
    });
}

function addSavedCities() {
    for (let i = 0; i < localStorage.length; i++) {
        const newCity = newCityLoaderInfo();
        let key = localStorage.key(i);
        request(['q=' + key]).then((jsonResult) => {
            addCity(jsonResult, newCity);
        });
    }
}

function getLocation() {
    currentCityInfoLoader();
    let currentLocation = navigator.geolocation;
    if (currentLocation) {
        currentLocation.getCurrentPosition(
            (position) => {
                fillCurrentCityInfo([`lat=${position.coords.latitude}`, `lon=${position.coords.longitude}`]);
            },
            (error) => {
                fillCurrentCityInfo(['q=Saint Petersburg']);
            }
        );
    } else {
        fillCurrentCityInfo(['q=Saint Petersburg']);
    }
}

function currentCityInfoLoader() {
    document.getElementsByClassName('current-city-info')[0].innerHTML = '<div class="current-city-loader"></div>';
}

function fillCurrentCityInfo(params) {
    request(params).then((jsonResult) => {
        document.getElementsByClassName('current-city-info')[0].innerHTML = `
            <div class="current-city">
                <h2 class="current-city-name">${jsonResult.name}</h2>
                <div class="current-weather">
                    <img src="images/weather/${getWeatherIcon(jsonResult)}.png" class="current-weather-img" alt="weather"/>
                    <p class="current-degrees">${Math.floor(jsonResult.main.temp)}&deg;C</p>
                </div>
            </div>
            <ul class="weather-info">
                ${fillWeatherInfo(jsonResult)}
            </ul>`;
    });
}

function fillWeatherInfo(jsonResult) {
    return `<ul class="weather-info">
            <li class="characteristic">
                <span>Ветер</span>
                <p>${getTypeOfWind(jsonResult.wind.speed)}, ${jsonResult.wind.speed} m/s, ${getWindDirection(jsonResult.wind.deg)}</p>
            </li>

            <li class="characteristic">
                <span>Облачность</span>
                <p>${getTypeOfCloudy(jsonResult.clouds.all)}</p>
            </li>

            <li class="characteristic">
                <span>Давление</span>
                <p>${jsonResult.main.pressure} hpa</p>
            </li>

            <li class="characteristic">
                <span>Влажность</span>
                <p>${jsonResult.main.humidity} %</p>
            </li>

            <li class="characteristic">
                <span>Координаты</span>
                <p>[${jsonResult.coord.lat}, ${jsonResult.coord.lon}]</p>
            </li>
        </ul>`;
}


function getTypeOfWind(wind) {
    if (wind >= 0 && wind < 6) {
        return 'Light breeze';
    } else if (wind >= 6 && wind < 15) {
        return 'Moderate breeze';
    } else if (wind >= 15 && wind < 25) {
        return 'Windy';
    } else if (wind >= 25 && wind < 33) {
        return 'Very windy';
    } else if (wind >= 33) {
        return 'Strong wind';
    }
}

function getWindDirection(deg) {
    if (deg > 11.25 && deg <= 33.75) {
        return 'North-Northeast'
    }
    if (deg > 33.75 && deg <= 56.25) {
        return 'Northeast'
    }
    if (deg > 56.25 && deg <= 78.75) {
        return 'East-Northeast'
    }
    if (deg > 78.75 && deg <= 101.25) {
        return 'East'
    }
    if (deg > 101.25 && deg <= 123.75) {
        return 'East-Southeast'
    }
    if (deg > 123.75 && deg <= 146.25) {
        return 'Southeast'
    }
    if (deg > 146.25 && deg <= 168.75) {
        return 'South-Southeast'
    }
    if (deg > 168.75 && deg <= 191.25) {
        return 'South'
    }
    if (deg > 191.25 && deg <= 213.75) {
        return 'South-Southwest'
    }
    if (deg > 213.75 && deg <= 236.25) {
        return 'Southwest'
    }
    if (deg > 236.25 && deg <= 258.75) {
        return 'West-Southwest'
    }
    if (deg > 258.75 && deg <= 281.25) {
        return 'West'
    }
    if (deg > 281.25 && deg <= 303.75) {
        return 'West-Northwest'
    }
    if (deg > 303.75 && deg <= 326.25) {
        return 'Northwest'
    }
    if (deg > 326.25 && deg <= 346.75) {
        return 'North-Northwest'
    }
    return 'North'
}

function getTypeOfCloudy(percent) {
    if (percent < 12.5) {
        return 'Clear';
    } else if (percent >= 12.5 && percent < 37.5) {
        return 'Mostly clear';
    } else if (percent >= 37.5 && percent < 62.5) {
        return 'Partly cloudy';
    } else if (percent >= 62.5 && percent < 87.5) {
        return 'Mostly cloudy';
    } else if (percent >= 87.5) {
        return 'Cloudy';
    }
}

function addNewCity() {
    const formData = new FormData(addNewCityForm);
    const cityName = formData.get('newCityName').toString();
    // const cityName = 'Moscow';
    addNewCityForm.reset();
    if (localStorage.hasOwnProperty(cityName)) {
        return;
    }
    const newCity = newCityLoaderInfo();
    request(['q=' + cityName]).then((jsonResult) => {
        if (jsonResult && !localStorage.hasOwnProperty(jsonResult.name)) {
            localStorage.setItem(jsonResult.name, '');
            addCity(jsonResult, newCity);
        } else {
            newCity.remove();
        }
    });
}

function newCityLoaderInfo() {
    let newCity = document.createElement('li');
    newCity.className = 'favorite-city';
    newCity.innerHTML = '<div class="current-city-loader"></div>';
    document.getElementsByClassName('favorite-cities')[0].appendChild(newCity);
    return newCity;
}

function addCity(jsonResult, newCity) {
    const cityName = jsonResult.name;
    newCity.id = cityName.split(' ').join('-');
    newCity.innerHTML = `<div class="favorite-weather">
                            <h3>${cityName}</h3>
                            <p class="degrees">${Math.floor(jsonResult.main.temp)}&deg;C</p>
                            <img src="images/weather/${getWeatherIcon(jsonResult)}.png" class="favorite-weather-img" alt="weather small"/>
                            <button onclick="deleteCity(\'${cityName}\');" class="delete-btn">+</button>
                        </div>
 
                        <ul class="weather-info">
                            ${fillWeatherInfo(jsonResult)}
                        </ul>`;
}

function deleteCity(cityName) {
    localStorage.removeItem(cityName);
    document.getElementById(cityName.split(' ').join('-')).remove();
}

function getWeatherIcon(jsonResult) {
    let clouds = haveClouds(jsonResult.clouds.all);
    let wind = haveWind(jsonResult.wind.speed);
    let precipitation = havePrecipitation(jsonResult);
    let timeOfDay = getTimeOfDay(jsonResult);

    if (clouds === 'cloudy' && precipitation === 'no' && wind === 'no') {
        return 'cloud';
    } else if (clouds === 'variable' && precipitation === 'no' && wind === 'no' && timeOfDay === 'day') {
        return 'variable-cloudy-day';
    } else if (clouds === 'variable' && precipitation === 'no' && wind === 'no' && timeOfDay === 'night') {
        return 'variable-cloudy-night';
    } else if (clouds === 'cloudy' && precipitation === 'no' && wind !== 'no') {
        return 'wind';
    } else if (clouds === 'variable' && precipitation === 'no' && wind !== 'no' && timeOfDay === 'day') {
        return 'wind-day';
    } else if (clouds === 'variable' && precipitation === 'no' && wind !== 'no' && timeOfDay === 'night') {
        return 'wind-night';
    } else if (clouds === 'cloudy' && (precipitation === 'rain' || precipitation === 'downpour') && wind === 'tempest') {
        return 'tempest';
    } else if (clouds === 'cloudy' && (precipitation === 'rain' || precipitation === 'downpour') && wind === 'tempest' && timeOfDay === 'day') {
        return 'tempest-day';
    } else if (clouds === 'cloudy' && (precipitation === 'rain' || precipitation === 'downpour') && wind === 'tempest' && timeOfDay === 'night') {
        return 'tempest-night';
    } else if (clouds === 'cloudy' && precipitation === 'mistyrain') {
        return 'mistyrain';
    } else if (clouds === 'variable' && precipitation === 'mistyrain' && timeOfDay === 'day') {
        return 'mistyrain-day';
    } else if (clouds === 'variable' && precipitation === 'mistyrain' && timeOfDay === 'night') {
        return 'mistyrain-night';
    } else if (clouds === 'cloudy' && precipitation === 'rain') {
        return 'rain';
    } else if (clouds === 'variable' && precipitation === 'rain' && timeOfDay === 'day') {
        return 'rain-day';
    } else if (clouds === 'variable' && precipitation === 'rain' && timeOfDay === 'night') {
        return 'rain-night';
    } else if (clouds === 'cloudy' && precipitation === 'downpour') {
        return 'downpour';
    } else if (clouds === 'variable' && precipitation === 'downpour' && timeOfDay === 'day') {
        return 'downpour-day';
    } else if (clouds === 'variable' && precipitation === 'downpour' && timeOfDay === 'night') {
        return 'downpour-night';
    } else if (clouds === 'cloudy' && precipitation === 'snow') {
        return 'snow';
    } else if (clouds === 'variable' && precipitation === 'snow' && timeOfDay === 'day') {
        return 'snow-day';
    } else if (clouds === 'variable' && precipitation === 'snow' && timeOfDay === 'night') {
        return 'snow-night';
    }

    if (timeOfDay === 'night') {
        return 'moon';
    }
    return 'sun';
}

function haveClouds(clouds) {
    if (clouds <= 30) { // ясно
        return 'no';
    } else if (clouds <= 70) { // переменно
        return 'variable';
    }
    return 'cloudy';
}

function haveWind(wind) {
    if (wind < 14) {
        return 'no';
    } else if (wind < 33) {
        return 'windy';
    }
    return 'tempest';
}

function havePrecipitation(jsonResult) {
    let snow = jsonResult.snow;
    let rain = jsonResult.rain;
    if (snow > rain) {
        if (snow > 0.1) {
            return 'snow';
        }
    } else if (rain >= snow) {
        if (rain < 3) {
            return 'mistyrain';
        } else if (rain < 15) {
            return 'rain';
        } else if (rain > 14) {
            return 'downpour';
        }
    }
    return 'no';
}

function getTimeOfDay(jsonResult) {
    let now = jsonResult.dt;
    let sunrise = jsonResult.sys.sunrise;
    let sunset = jsonResult.sys.sunset;
    if (now > sunset) {
        return 'night';
    }
    return 'day';
}

getLocation();
addSavedCities();
