var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('pages/www-index', {
      title: "WWW" + ((req.query.rmd) ? ' | RMD' : '') + '' + ((req.query.rcol) ? ' | RCol' : ''),
      rmd: ((req.query.rmd) ? true : false),
      rcol: ((req.query.rcol) ? true : false)
    });
});

module.exports = router;
