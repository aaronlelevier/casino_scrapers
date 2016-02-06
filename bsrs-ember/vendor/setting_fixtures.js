var BSRS_SETTING_FACTORY = (function() {
    var factory = function(setting_defaults) {
        this.setting_defaults = setting_defaults;
    };
    factory.prototype.detail = function() {
        return {
            'id': this.setting_defaults.id,
            'name': this.setting_defaults.name,
            'settings': this.setting_defaults.settings
        }
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
