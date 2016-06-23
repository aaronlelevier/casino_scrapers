var BSRS_SETTING_FACTORY = (function() {
    var factory = function(setting_defaults) {
        this.setting_defaults = setting_defaults;
    };
    factory.prototype.generate = function(i) {
        var id = i || this.setting_defaults.id;
        return {
            id: id,
            company_code: this.setting_defaults.company_code,
            company_name: this.setting_defaults.company_name,
            dashboard_text: this.setting_defaults.dashboard_text,
            dt_start: this.setting_defaults.dt_start_id,
            // needed
            default_currency: this.setting_defaults.company_code,
            test_mode: this.setting_defaults.test_mode,
        }
    };
    factory.prototype.detail = function() {
        return this.generate();
    };
    factory.prototype.put = function(id) {
        return this.generate();
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var setting_defaults = require('./defaults/setting');
    module.exports = new BSRS_SETTING_FACTORY(setting_defaults);
} else {
    define('bsrs-ember/vendor/setting_fixtures',
        ['exports', 'bsrs-ember/vendor/defaults/setting'],
        function (exports, setting_defaults) {
            'use strict';
            return new BSRS_SETTING_FACTORY(setting_defaults);
        }
    );
}
