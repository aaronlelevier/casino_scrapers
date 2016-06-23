var BSRS_SETTING_FACTORY = (function() {
    var factory = function(tenant) {
        this.tenant = tenant;
    };
    factory.prototype.generate = function(i) {
        var id = i || this.tenant.id;
        return {
            id: id,
            company_code: this.tenant.company_code,
            company_name: this.tenant.company_name,
            dashboard_text: this.tenant.dashboard_text,
            dt_start_id: this.tenant.dt_start_id,
            dt_start: {
                id: this.tenant.dt_start_id,
                key: this.tenant.dt_start_key,
            },
            default_currency_id: this.tenant.default_currency_id,
            test_mode: this.tenant.test_mode,
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
    var tenant = require('./defaults/tenant');
    module.exports = new BSRS_SETTING_FACTORY(tenant);
} else {
    define('bsrs-ember/vendor/tenant_fixtures',
        ['exports', 'bsrs-ember/vendor/defaults/tenant'],
        function (exports, tenant) {
            'use strict';
            return new BSRS_SETTING_FACTORY(tenant);
        }
    );
}
