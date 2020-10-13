let updateLocationForm = document.forms.namedItem('updateLocation');

updateLocationForm.addEventListener('click', (event) => {
    getLocation();
    event.preventDefault();
})

function request(params) {
    params.push('units=metric');
    params.push('appid=f80f663722c0d3dd6beacd446c31524a');
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
                    <img src="images/broken_clouds.png" class="current-weather-img" alt="weather"/>
                    <p class="current-degrees">${Math.floor(jsonResult.main.temp)}&deg;C</p>
                </div>
            </div>
            <ul class="weather-info">
                ${fillCurrentWeatherInfo(jsonResult)}
            </ul>`;
    });
}

function fillCurrentWeatherInfo(jsonResult) {
    return `<ul class="weather-info">
            <li class="characteristic">
                <span>Ветер</span>
                <p>${getTypeOfWind(jsonResult.wind.speed)}, ${jsonResult.wind.speed} m/s, North-northwest</p>
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

getLocation();