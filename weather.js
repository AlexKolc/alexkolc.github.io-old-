let updateLocationForm = document.forms.namedItem('updateLocation');

updateLocationForm.addEventListener('submit', (event) => {
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
                <p>${jsonResult.wind.speed} m/s, North-northwest</p>
            </li>

            <li class="characteristic">
                <span>Облачность</span>
                <p>${jsonResult.clouds.all} %</p>
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

getLocation();