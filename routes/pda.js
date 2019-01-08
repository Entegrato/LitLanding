var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('pages/pda-index', {
    title: "PDA | rmd: " + ((req.query.rmd == 1) ? 1 : 0) + ' | ' + ((req.query.rcol == 1) ? 1 : 0),
    rmd: ((req.query.rmd) ? true : false),
    rcol: ((req.query.rcol) ? true : false)
  });
});

module.exports = router;
