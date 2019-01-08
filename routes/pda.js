var express = require('express');
var router = express.Router();

var data = require('../views/partials/data-object.json');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('pages/pda-index', {
    title: "PDA" + ((req.query.rmd) ? ' | RMD' : '') + '' + ((req.query.rcol) ? ' | RCol' : ''),
    rmd: ((req.query.rmd) ? true : false),
    rcol: ((req.query.rcol) ? true : false),
    data: data
  });
});

module.exports = router;
