var BSRS_SETTING_FACTORY = (function() {
    var factory = function(setting_defaults) {
        this.setting_defaults = setting_defaults;
    };
    factory.prototype.generate = function(i) {
        var id = i || this.setting_defaults.id;
        return {
            'id': id,
            'name': this.setting_defaults.name,
            'title': this.setting_defaults.title,
            'settings': this.setting_defaults.settings
        }
    };
    factory.prototype.detail_raw = function() {
        return this.generate();
    };
    factory.prototype.detail = function() {
        return {
            'id': this.setting_defaults.id,
            'name': this.setting_defaults.name,
            'title': this.setting_defaults.title,
            'welcome_text': this.setting_defaults.welcome_text
        }
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