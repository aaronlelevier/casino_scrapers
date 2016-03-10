var Tab_Fixtures = (function() {
    var factory = function(defaults) {
        this.defaults = defaults;
    };
    factory.prototype.get = function(new_id) {
        var tab_id = new_id ? new_id : this.defaults.id_one;
        return {
            id: tab_id,
            doc_type: this.defaults.doc_type_one,
            doc_route: this.defaults.doc_route_one,
            templateModelField: this.defaults.templateModelField_one,
            redirect: this.defaults.redirect_one,
            newModel: this.defaults.newModel_one
        }
    };
    return factory;
})();

//adding a new fixture requires you to import it in ember-cli-build.js
if (typeof window === 'undefined') {
    var tab_defaults = require('../vendor/defaults/tab');
    module.exports = new Tab_Fixtures(tab_defaults);
} else {
    define('bsrs-ember/vendor/tab_fixtures', ['exports', 'bsrs-ember/vendor/defaults/tab'], function(exports, tab_defaults) {
        'use strict';
        return new Tab_Fixtures(tab_defaults);
    });
}
