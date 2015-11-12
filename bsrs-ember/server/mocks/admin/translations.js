var FIXTURES = require('../../../vendor/admin_translation_fixtures.js');

module.exports = function(app) {
    var express = require('express');
    var adminTranslationsRouter = express.Router();

    adminTranslationsRouter.get('/', function(req, res) {
        var page = req.query.page || 1;
        var sort = req.query.ordering ? req.query.ordering.trim() : '';
        var search = req.query.search ? req.query.search.trim() : '';
        var page_size = req.query.page_size ? req.query.page_size.trim() : '';
        if(search && search.length > 0) {
            var term = decodeURIComponent(search);
            res.send(FIXTURES.searched(term, sort, page));
        } else if(sort && sort.length > 0) {
            res.send(FIXTURES.sorted(sort, page));
        } else if(page_size && page_size.length > 0) {
            res.send(FIXTURES.paginated(page_size));
        } else if(parseInt(page) > 1) {
            res.send(FIXTURES.list_two());
        }else{
            res.send(FIXTURES.list());
        }
    });

    adminTranslationsRouter.post('/', function(req, res) {
        res.status(201);
        res.send(req.body);
    });

    adminTranslationsRouter.get('/:id', function(req, res) {
        res.send(FIXTURES.detail(req.params.id));
    });

    adminTranslationsRouter.put('/:id', function(req, res) {
        res.send(FIXTURES.put(req.params.id));
    });

    adminTranslationsRouter.delete('/:id', function(req, res) {
        res.status(204).end();
    });

    app.use('/api/admin/translations/', adminTranslationsRouter);
};
