var SETTING_FIXTURES = require('../../../vendor/setting_fixtures.js');

module.exports = function(app) {
    var express = require('express');
    var adminSettingsRouter = express.Router();

    adminSettingsRouter.get('/:id', function(req, res) {
        res.send(SETTING_FIXTURES.detail_raw(req.params.id));
    });

    adminSettingsRouter.put('/:id', function(req, res) {
        res.send(SETTING_FIXTURES.put(req.params.id));
    });

    app.use('/api/admin/settings/', adminSettingsRouter);
};
