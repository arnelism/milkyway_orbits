var express = require('express');
var logger = require('morgan');
var router = express.Router();

var app = express();

/* GET home page. */
router.get('/getIncidence', (req, res) => {
    res.setHeader("Content-Type", "Application/JSON");
    res.send({foo: Math.random()});
});

app.use(logger('dev'));
app.use(express.json());
app.use('/', router);






module.exports = app;
