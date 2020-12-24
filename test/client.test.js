const chai = require('chai');
const chai_http = require('chai-http');
chai.use(chai_http);
const expect = require('chai').expect;
const mocha = require('mocha');
const sinon = require('sinon');
const afterEach = mocha.afterEach;
const beforeEach = mocha.beforeEach;
require('sinon-mongo');
const fetch = require('isomorphic-fetch');
const fetchMock = require('fetch-mock');
const describe = mocha.describe;
const it = mocha.it;
chai.should();
const JSDOM = require('jsdom').JSDOM;

html = `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather</title>
    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
<header class="weather-top">
    <h1 class="weather-top-name">Погода здесь</h1>
    <form method="get" name="updateLocation">
        <button class="update-btn" type="button" name="updateLocation">Обновить геолокацию</button>
        <button class="update-btn-img" type="button" name="updateLocation">
            <img src="images/location-update.png" class="update-img" alt="update"/>
        </button>
    </form>
</header>

<main class="main">
    <section class="current-city-info"></section>

    <section class="favorite">
        <div class="favorite-top">
            <h2>Избранное</h2>
            <div>
                <form method="get" name="addNewCity" class="add-new-city">
                    <input name="newCityName" class="new-city" type="text" placeholder="Добавить новый город">
                    <input type="submit" value="+" class="add-btn">
                </form>
            </div>
        </div>

        <ul class="favorite-cities"></ul>
    </section>
</main>

<template id="tempCurrentCityLoader">
    <div class="current-city-loader"></div>
</template>

<template id="tempFavoriteCityLoader">
    <li class="favorite-city">
        <div class="current-city-loader"></div>
    </li>
</template>

<template id="tempCurrentCity">
    <div class="current-city">
        <h2 class="current-city-name"></h2>
        <div class="current-weather">
            <img src="" class="current-weather-img" alt="weather"/>
            <p class="current-degrees"></p>
        </div>
    </div>
    <ul class="weather-info">
        <li class="characteristic">
            <span>Ветер</span>
            <p></p>
        </li>
        <li class="characteristic">
            <span>Облачность</span>
            <p></p>
        </li>
        <li class="characteristic">
            <span>Давление</span>
            <p></p>
        </li>
        <li class="characteristic">
            <span>Влажность</span>
            <p></p>
        </li>
        <li class="characteristic">
            <span>Координаты</span>
            <p></p>
        </li>
    </ul>
</template>

<template id="tempFavoriteCity">
    <li class="favorite-city">
        <div class="favorite-weather">
            <h3 class="favorite-city-name"></h3>
            <p class="degrees"></p>
            <img src="" class="favorite-weather-img" alt="weather small"/>
            <button onclick="" type="button" name="button" class="delete-btn">+</button>
        </div>

        <ul class="weather-info">
            <li class="characteristic">
                <span>Ветер</span>
                <p></p>
            </li>
            <li class="characteristic">
                <span>Облачность</span>
                <p></p>
            </li>
            <li class="characteristic">
                <span>Давление</span>
                <p></p>
            </li>
            <li class="characteristic">
                <span>Влажность</span>
                <p></p>
            </li>
            <li class="characteristic">
                <span>Координаты</span>
                <p></p>
            </li>
        </ul>
    </li>
</template>
</body>`

window = new JSDOM(html).window;
document = window.document;
let client = require('../client/client');
global.window = window;
window.alert = sinon.spy();
global.document = window.document;
global.navigator = {
    userAgent: 'node.js'
};
global.fetch = fetch;
global.alert = window.alert;
global.FormData = window.FormData;

const geolocate = require('mock-geolocation');
const {getAddNewCityForm} = require("../client/client");
geolocate.use();
client.init();
const baseURL = 'http://localhost:8081';

const spbResponse = {
    coord: {
        lon: 30.26,
        lat: 59.89
    },
    weather: [{
        id: 620,
        main: "Snow",
        description: "light shower snow",
        icon: "13n"
    }],
    base: "stations",
    main: {
        temp: -1,
        feels_like: -6.77,
        temp_min: -2,
        temp_max: -1.11,
        pressure: 1006,
        humidity: 92
    },
    visibility: 10000,
    wind: {
        speed: 4,
        deg: 160
    },
    snow: {
        "1h": 0.24
    },
    clouds: {
        all: 90
    },
    dt: 1608737704,
    sys: {
        type: 1,
        id: 8926,
        country: "RU",
        sunrise: 1608706856,
        sunset: 1608728118
    },
    timezone: 10800,
    id: 498817,
    name: "Saint Petersburg",
    cod: 200
};

const spbCurrent = `
    <div class="current-city">
        <h2 class="current-city-name">Saint Petersburg</h2>
        <div class="current-weather">
            <img src="images/weather/snow.png" class="current-weather-img" alt="weather">
            <p class="current-degrees">-1°C</p>
        </div>
    </div>
    <ul class="weather-info">
        <li class="characteristic">
            <span>Ветер</span>
            <p>Light breeze, 4 m/s, South-Southeast</p>
        </li>
        <li class="characteristic">
            <span>Облачность</span>
            <p>Cloudy</p>
        </li>
        <li class="characteristic">
            <span>Давление</span>
            <p>1006 hpa</p>
        </li>
        <li class="characteristic">
            <span>Влажность</span>
            <p>92 %</p>
        </li>
        <li class="characteristic">
            <span>Координаты</span>
            <p>[59.89, 30.26]</p>
        </li>
    </ul>
`

const spbFavourite = `
    <li class="favorite-city">
        <div class="favorite-weather">
            <h3 class="favorite-city-name">Saint Petersburg</h3>
            <p class="degrees">-1°C</p>
            <img src="images/weather/snow.png" class="favorite-weather-img" alt="weather small">
            <button onclick="" type="button" name="button" class="delete-btn">+</button>
        </div>

        <ul class="weather-info">
            <li class="characteristic">
                <span>Ветер</span>
                <p>Light breeze, 4 m/s, South-Southeast</p>
            </li>
            <li class="characteristic">
                <span>Облачность</span>
                <p>Cloudy</p>
            </li>
            <li class="characteristic">
                <span>Давление</span>
                <p>1006 hpa</p>
            </li>
            <li class="characteristic">
                <span>Влажность</span>
                <p>92 %</p>
            </li>
            <li class="characteristic">
                <span>Координаты</span>
                <p>[59.89, 30.26]</p>
            </li>
        </ul>
    </li>
`

const spbCur = `
    <div class="current-city-loader"></div>
`;

const spbFav = `<div class="current-city-loader"></div>`

const delay = require('delay')

describe('CLIENT: load info about current city', () => {
    afterEach(() => {
        fetchMock.done();
        fetchMock.restore();
    });

    it('fill loader for current city', (done) => {
        client.currentCityInfoLoader();
        const loader = document.getElementsByClassName('current-city-info')[0];
        loader.innerHTML.should.be.eql(spbCur);
        done()
    });

    it('load current city by city name', (done) => {
        const cityName = 'Saint Petersburg'
        const url = baseURL + '/weather/city?q=' + cityName;
        fetchMock.once(url, spbResponse);
        client.fillCurrentCityInfo('city', ['q=Saint Petersburg']).then((res) => {
            const currentCity = document.getElementsByClassName('current-city-info')[0];
            currentCity.innerHTML.should.be.eql(spbCurrent);
            done();
        }).catch(done);
    });

    it('load current city by coordinates', (done) => {
        let lat = '59.89';
        let lon = '30.26';
        const url = baseURL + '/weather/coordinates?lat=' + lat + '&lon=' + lon;
        fetchMock.once(url, spbResponse);
        client.fillCurrentCityInfo('coordinates', [`lat=${lat}`, `lon=${lon}`]).then((res) => {
            const currentCity = document.getElementsByClassName('current-city-info')[0];
            currentCity.innerHTML.should.be.eql(spbCurrent);
            done();
        }).catch(done);
    });

    it('load main city by position', (done) => {
        let lat = '59.89';
        let lon = '30.26';
        const url = baseURL + '/weather/coordinates?lat=' + lat + '&lon=' + lon;
        fetchMock.get(url, spbResponse);
        client.getLocation()
        geolocate.send({latitude: 59.89, longitude: 30.26});
        const currentCity = document.getElementsByClassName('current-city-info')[0];
        currentCity.innerHTML.should.be.eql(spbCurrent);
        done();

    });
})

describe('CLIENT: add new favourite city', () => {
    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('add city function', (done) => {
        let newCity = client.newCityLoaderInfo();
        client.addCity(spbResponse, newCity);
        const lastCity = document.getElementsByClassName('favorite-cities')[0].lastChild;
        lastCity.innerHTML.should.be.eql(spbFavourite);
        document.getElementsByClassName('favorite-cities').length.should.be.eql(1);
        done();
    });

    it('add new city', (done) => {
        const cityName = 'Saint Petersburg'
        let url = baseURL + '/weather/city?q=' + cityName;
        fetchMock.get(url, spbResponse);
        url = baseURL + '/favourites';
        fetchMock.post(url, 200);
        let form = document.forms.namedItem('addNewCity');
        form.getElementsByTagName('input')[0].value = cityName;
        client.addNewCity().then((res) => {
            let lastCity = document.getElementsByClassName('favorite-cities')[0].lastChild;
            lastCity.innerHTML.should.be.eql(spbFavourite);
            done();
        }).catch(done);
    });

    it('try add city twice', (done) => {
        const cityName = 'Saint Petersburg'
        let url = baseURL + '/weather/city?q=' + cityName;
        fetchMock.once(url, spbResponse);
        url = baseURL + '/favourites';
        fetchMock.post(url, 400);
        let form = document.forms.namedItem('addNewCity');
        form.getElementsByTagName('input')[0].value = cityName;
        alert = sinon.spy();
        client.addNewCity().then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        })
    });

    it('get alert for wrong city name', (done) => {
        const cityName = 'Saint Peterburg'
        let url = baseURL + '/weather/city?q=' + cityName;
        alert = sinon.spy();
        fetchMock.once(url, 404);
        client.request('city', ['q=Saint Peterburg']).then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        });
    });

})

describe('CLIENT: check request', () => {
    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('get alert for wrong city name', (done) => {
        const cityName = 'Saint Peterburg'
        let url = baseURL + '/weather/city?q=' + cityName;
        alert = sinon.spy();
        fetchMock.once(url, 404);
        client.request('city', ['q=' + cityName]).then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        });
    });

    it('get alert for server error', (done) => {
        const cityName = 'Saint Petersburg'
        let url = baseURL + '/weather/city?q=' + cityName;
        alert = sinon.spy();
        fetchMock.once(url, 503);
        client.request('city', ['q=' + cityName]).then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        });
    });
})

describe('CLIENT: get all favourites cities', () => {
    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('get cities from server', (done) => {
        const cityName = 'Saint Petersburg'
        let url = baseURL + '/weather/city?q=' + cityName;
        fetchMock.get(url, spbResponse);
        url = baseURL + '/favourites';
        fetchMock.get(url, {cities: [cityName]});
        client.addSavedCities().then((res) => {
            let lastCity = document.getElementsByClassName('favorite-cities')[0].lastChild;
            lastCity.innerHTML.should.be.eql(spbFavourite);
            done();
        }).catch(done);
    })

    it('get cities with server error', (done) => {
        let url = baseURL + '/favourites';
        fetchMock.get(`${baseURL}/favourites`, 500);
        client.addSavedCities().then((res) => {
            let lastCity = document.getElementsByClassName('favorite-cities')[0];
            lastCity.innerHTML.should.be.eql("");
            done();
        }).catch(done);
    })
});
