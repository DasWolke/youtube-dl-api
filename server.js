/**
 * Created by julia on 13.09.2016.
 */
var config = require('./config/main.json');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = require('./routes/api');
var dd_options = {
    'response_code':true,
    'tags': ['youtube-proxy:express']
};

var connect_datadog = require('connect-datadog')(dd_options);
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('audio/'));
app.listen(config.web_port, '127.0.0.1');
console.log('Server started!');
app.use(connect_datadog);
app.use(router);