var debug = require('debug')('litland.dev:server');
var http = require('http');
var config = require('./config');
var log = require('./libs/winston-logger')(module);

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

// Подключение роутов фронта
var www = require('./routes/www');
var pda = require('./routes/pda');

// Запуск сервера
var app = express();
var server = http.createServer(app);

// Установка макетов
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.disable('x-powered-by');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.set('trust proxy', 1); // trust first proxy
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

// Роуты
app.use('/', www);
app.use('/www', www);
app.use('/pda', pda);

// 404
app.use(function (req, res, next) {
  var err = new Error('404, Not Found');
  err.status = 404;
  next(err);
});

// При ошибке 500
app.use(function (err, req, res, next) {
    res.locals.message = err.message; //err.message;
    res.locals.error = err; //err;
    res.status(err.status || 500);
    res.render('pages/error', { title: err.status });
});

// Запуск сервера
var port = config.get('port');
app.set('port', port);
server.listen(port);
