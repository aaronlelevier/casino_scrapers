var <%= CapitalizeModule %>_FIXTURES = require('../../../vendor/<%= dasherizedModuleName %>_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var admin<%= CapFirstLetterModuleName %>sRouter = express.Router();

  admin<%= CapFirstLetterModuleName %>sRouter.get('/', function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.ordering ? req.query.ordering.trim() : '';
    var search = req.query.search ? req.query.search.trim() : '';
    var page_size = req.query.page_size ? req.query.page_size.trim() : '';
    if(search && search.length > 0) {
        var term = decodeURIComponent(search);
        res.send(<%= CapitalizeModule %>_FIXTURES.searched(term, sort, page));
    } else if(sort && sort.length > 0) {
        res.send(<%= CapitalizeModule %>_FIXTURES.sorted(sort, page));
    } else if(page_size && page_size.length > 0) {
        res.send(<%= CapitalizeModule %>_FIXTURES.paginated(page_size));
    } else if(parseInt(page) > 1) {
        res.send(<%= CapitalizeModule %>_FIXTURES.list_two());
    }else{
        res.send(<%= CapitalizeModule %>_FIXTURES.list());
    }
  });

  admin<%= CapFirstLetterModuleName %>sRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  admin<%= CapFirstLetterModuleName %>sRouter.get('/:id', function(req, res) {
    res.send(<%= CapitalizeModule %>_FIXTURES.detail());
  });

  admin<%= CapFirstLetterModuleName %>sRouter.put('/:id', function(req, res) {
    res.send(<%= CapitalizeModule %>_FIXTURES.put(req.params.id));
  });

  admin<%= CapFirstLetterModuleName %>sRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/<%= dasherizedModuleName %>s', admin<%= CapFirstLetterModuleName %>sRouter);
};
