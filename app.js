const express = require('express');
const logger = require('morgan');
const mysql = require("mysql");
const IncidenceService = require("./service/IncidenceService").default;

const router = express.Router();
const app = express();

const conn = mysql.createConnection({
    host: "orbits.cgktvajsllsj.eu-central-1.rds.amazonaws.com",
    user: "jebediah",
    password: 'kerman',
    database: 'orbits'
});

conn.connect((err) => {
    if (err) throw err;

    const service = new IncidenceService(conn);
    router.get('/getIncidence', (req, res) => {

        service.getIncidenceAndBearing(req.query.lat, req.query.lng, req.query.datetime, (data) => {
            res.setHeader("Content-Type", "Application/JSON");
            res.send(data);
        });
    });

    router.get('/getOverflights', (req, res) => {

        service.getOverflights(req.query.lat, req.query.lng, (data) => {
            res.setHeader("Content-Type", "Application/JSON");
            res.send(data);
        });
    });

    router.get('/getOverflightsGeoJSON', (req, res) => {

        service.getOverflightsGeoJSON(req.query.lat, req.query.lng, (data) => {
            res.setHeader("Content-Type", "Application/JSON");
            res.send(data);
        });
    });

    app.use(logger('dev'));
    app.use(express.json());
    app.use('/', router);
});

module.exports = app;
