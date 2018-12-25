var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('pages/pda-index', {
      title: "WWW | rmd: " + ((req.query.rmd == 1) ? 1 : 0),
      rmd: ((req.query.rmd) ? true : false)
    });
});

module.exports = router;
