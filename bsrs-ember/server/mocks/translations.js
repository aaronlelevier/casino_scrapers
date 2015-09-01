var TRANSLATION_FIXTURES = require('../../vendor/translation_fixtures.js');

module.exports = function(app) {

  var express = require('express');
  var translationRouter = express.Router();

  translationRouter.get('/', function(req, res) {
    res.send(TRANSLATION_FIXTURES.generate(req.query.locale));
  });

  app.use('/api/translations/', translationRouter);

};
