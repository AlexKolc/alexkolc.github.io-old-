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
                    <img src="images/broken_clouds.png" class="current-weather-img" alt="weather"/>
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
    //const imageName = getIcon(jsonResult);
    newCity.innerHTML = `<div class="favorite-weather">
                            <h3>${cityName}</h3>
                            <p class="degrees">${Math.floor(jsonResult.main.temp)}&deg;C</p>
                            <img src="images/broken_clouds.png" class="favorite-weather-img" alt="weather small"/>
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

getLocation();
addSavedCities();
