module.exports = function(app) {
  var express = require('express');
  var loginRouter = express.Router();

  loginRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  app.use('/api/wat', loginRouter);
};
