module.exports = function(app) {
  var express = require('express');
  var attachmentsRouter = express.Router();

  attachmentsRouter.get('/', function(req, res) {
    var json = {'count':count,'next':null,'previous':null,'results': []};
    res.send(json);
  });

  attachmentsRouter.post('/', function(req, res) {
    var json = {"id": "abc123","filename":"toranb.png","file":null};
    res.status(201);
    res.send(json);
  });

  app.use('/api/admin/attachments/', attachmentsRouter);
};
