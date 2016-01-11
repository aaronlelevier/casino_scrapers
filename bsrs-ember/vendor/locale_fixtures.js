var Aaron_Toran = (function() {
    var factory = function(defaults) {
        this.defaults = defaults;
    };
    factory.prototype.get = function() {
        return {
            id: this.defaults.idOne,
            native_name: this.defaults.native_nameOne,
            locale: this.defaults.localeOne,
            name: this.defaults.nameOne,
            presentation_name: this.defaults.presentation_nameOne,
            rtl: this.defaults.rtlOne
        }
    };
    return factory;
})();

//adding a new fixture requires you to import it in ember-cli-build.js
if (typeof window === 'undefined') {
    var locale_defaults = require('../vendor/defaults/locale');
    module.exports = new Aaron_Toran(locale_defaults);
} else {
    define('bsrs-ember/vendor/locale_fixtures', ['exports', 'bsrs-ember/vendor/defaults/locale'], function(exports, locale_defaults) {
        'use strict';
        return new Aaron_Toran(locale_defaults);
    });
}