const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const server = express();
const port = 8081;
const api_key = '52f8f9af79e0664f928042deb0e2b888';
const bodyParser = require('body-parser');
const helmet = require('helmet');

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://mongodb_user:123654@cluster0.14oq0.mongodb.net/<Cluster0>?retryWrites=true&w=majority';
MongoClient.connect(uri, (err, database) => {
    if (err) {
        return console.log(err)
    }

    global.DB = database.db();
})

server.use(helmet());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.use(cors())

server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    next();
});

server.get('/weather/city', (req, res) => {
    let city = req.query.q;
    city = encodeURI(city);
    const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=metric' + '&appid=' + api_key;
    fetch(url).then(function (resp) {
        if (resp.status === 200) {
            return resp.json()
        } else {
            return 404
        }
    }).then(function (data) {
        res.send(data)
    })
})

server.get('/weather/coordinates', (req, res) => {
    let lat = req.query.lat;
    let lon = req.query.lon;
    fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&units=metric' + '&appid=' + api_key)
        .then(function (resp) {
            if (resp.status === 200) {
                return resp.json()
            } else {
                return 404
            }
        })
        .then(function (data) {
            res.send(data)
        })
})

server.get('/favourites', (req, res) => {
    let db = global.DB;
    db.collection('cities').find({}).toArray()
        .then(res => res.map((city) => city.name))
        .then((result) => {
            res.send({cities: result});
        })
        .catch((err) => {
            res.sendStatus(503);
        });
})

server.post('/favourites', (req, res) => {
    let city_name = req.body.name;
    let textType = typeof city_name;

    res.setHeader('Content-Type', `text/${textType}; charset=UTF-8`)

    let db = global.DB;
    db.collection('cities').find({name: city_name}).toArray().then((result) => {
        if (!result.length) {
            db.collection('cities').insertOne({name: city_name});
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    });
})

server.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS, POST');
    res.send('ok');
});

server.delete('/favourites', (req, res) => {
    let city_name = req.body.name;
    let db = global.DB;

    db.collection('cities').deleteOne({name: city_name}).then( (err, item) => {
        if (err) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200)
        }
    });
});


server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})

module.exports = server;