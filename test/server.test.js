const chai = require('chai');
const chai_http = require('chai-http');
const mocha = require('mocha');
const sinon = require('sinon');
require('sinon-mongo');
const afterEach = mocha.afterEach;
const beforeEach = mocha.beforeEach;
const fetchMock = require('fetch-mock');
const describe = mocha.describe;
const it = mocha.it;
chai.use(chai_http);
chai.should();
require('isomorphic-fetch');

const server = require('../server/server');

const baseURL = 'https://api.openweathermap.org/data/2.5/weather';
const apiKey = 'units=metric&appid=52f8f9af79e0664f928042deb0e2b888';

describe('SERVER: GET /weather/city', () => {
    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('ok response from weather server [correct city name]', (done) => {
        const responseBody = {
            coord: {
                lon: 30.26,
                lat: 59.89
            },
            name: 'Saint Petersburg'
        };
        let cityName = encodeURI('Saint Petersburg');
        let url = baseURL + '?q=' + cityName + apiKey;
        fetchMock.once(url, responseBody);
        chai.request(server)
            .get('/weather/city?q=' + cityName)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.have.property('coord').eql(responseBody.coord);
                res.body.should.have.property('name').eql(responseBody.name);
                done();
            });
    });

    it('error response from weather server [unknown place]', (done) => {
        let cityName = encodeURI('Saint Petesburg');
        let url = baseURL + '?q=' + cityName + apiKey;
        fetchMock.once(url, null);

        chai.request(server)
            .get('/weather/city?q=' + cityName)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    })
});

describe('SERVER: GET /weather/coordinates', () => {
    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('ok response from weather server [correct coordinates]', (done) => {
        const responseBody = {
            coord: {
                lon: 30.26,
                lat: 59.89
            },
            name: 'Saint Petersburg'
        };
        let lat = '59.89';
        let lon = '30.26';
        let url = baseURL + '?lat=' + lat + '&lon=' + lon + apiKey;
        fetchMock.once(url, responseBody);
        chai.request(server)
            .get('/weather/coordinates?lat=' + lat + '&lon=' + lon)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.have.property('coord').eql(responseBody.coord);
                res.body.should.have.property('name').eql(responseBody.name);
                done();
            });
    }).timeout(5000);

    it('error response from weather server [dont find city]', (done) => {
        let lat = '59.89';
        let lon = '500';
        let url = baseURL + '?lat=' + lat + '&lon=' + lon + apiKey;
        fetchMock.once(url, null);
        chai.request(server)
            .get('/weather/coordinates?lat=' + lat + '&lon=' + lon)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    }).timeout(5000);
});

describe('SERVER: GET /favourites', () => {
    it('return list favorites cities', (done) => {
        const docArray = [{name: 'Kandalaksha'}, {name: 'Shanghai'}, {name: 'Sydney'}];
        let mockCollection = sinon.mongo.collection();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        mockCollection.find
            .withArgs({})
            .returns(sinon.mongo.documentArray(docArray));

        const resultArray = ['Kandalaksha', 'Shanghai', 'Sydney'];
        chai.request(server)
            .get('/favourites')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.own.property('cities');
                res.body.cities.should.be.eql(resultArray);
                sinon.assert.calledOnce(mockCollection.find);
                done();
            });
    });

    it('should return a 503 error from weather database', (done) => {
        let mockCollection = sinon.mongo.collection();
        mockCollection
            .find
            .withArgs({})
            .returns(sinon.mongo.documentArray([null, {name: 'Shanghai'}]));

        global.DB = sinon.mongo.db({
            cities: mockCollection
        });

        chai.request(server)
            .get('/favourites')
            .end((err, res) => {
                res.should.have.status(503);
                sinon.assert.calledOnce(mockCollection.find);
                done();
            });
    });
});

describe('SERVER: POST /favourites', () => {
    it('ok add new city', (done) => {
        let mockCollection = sinon.mongo.collection();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        mockCollection.find
            .withArgs({name: 'Murmansk'})
            .returns(sinon.mongo.documentArray([]));
        mockCollection.insertOne
            .withArgs({name: 'Murmansk'})
            .resolves(true);
        chai.request(server)
            .post('/favourites')
            .send({name: 'Murmansk'})
            .end((err, res) => {
                res.should.have.status(200);
                sinon.assert.calledOnce(mockCollection.find);
                sinon.assert.calledOnce(mockCollection.insertOne);
                done();
            });
    });

    it('error when add new city twice', (done) => {
        let mockCollection = sinon.mongo.collection();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        mockCollection.find
            .withArgs({name: 'Murmansk'})
            .returns(sinon.mongo.documentArray([{name: 'Murmansk'}]));
        mockCollection.insertOne
            .withArgs({name: 'Murmansk'})
            .resolves();
        chai.request(server)
            .post('/favourites')
            .send({name: 'Murmansk'})
            .end((err, res) => {
                res.should.have.status(400);
                sinon.assert.calledOnce(mockCollection.find);
                sinon.assert.notCalled(mockCollection.insertOne);
                done();
            });
    });
});

describe('SERVER: DELETE /favourites', () => {

    it('ok delete city', (done) => {
        let mockCollection = sinon.mongo.collection();
        mockCollection.deleteOne
            .withArgs({name: 'Murmansk'})
            .resolves();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        chai.request(server)
            .delete('/favourites')
            .send({name: 'Murmansk'})
            .end((err, res) => {
                res.should.have.status(200);
                sinon.assert.calledOnce(mockCollection.deleteOne);
                done();
            });
    });

    it('error 400 when delete unknown city', (done) => {
        let mockCollection = sinon.mongo.collection();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        mockCollection.deleteOne
            .withArgs({name: 'Murmansk'})
            .resolves();
        chai.request(server)
            .delete('/favourites')
            .send({name: 'Murmansk'})
            .end((err, res) => {
                res.should.have.status(200);
                sinon.assert.calledOnce(mockCollection.deleteOne);
                done();
            });
    });

});

