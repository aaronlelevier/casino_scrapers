var BSRS_LOCALE_DEFAULTS_OBJECT = (function() {
    var factory = function() {};
    factory.prototype.defaults = function() {
        return {
            // one
            idOne: '1d4396a9-b91e-471b-91a0-c3e2440ae93b',
            native_nameOne: 'Español',
            localeOne: 'es',
            nameOne: 'Spanish',
            presentation_nameOne: 'Español',
            rtlOne: false,
            // tow
            idTwo: '7f3afd8b-8f2b-43e0-879a-3b60f81388ee',
            native_nameTwo: '',
            localeTwo: 'en',
            nameTwo: '',
            presentation_nameTwo: '',
            rtlTwo: false,
            // other
            idOther: '52f2e0eb-26a9-4588-9a09-ee9c812c594b',
            native_nameOther: 'en',
            localeOther: 'en',
            nameOther: 'en',
            presentation_nameOther: 'en',
            rtlOther: false,
        }
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_LOCALE_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/locale', ['exports'], function (exports) {
        'use strict';
        return new BSRS_LOCALE_DEFAULTS_OBJECT().defaults();
    });
}
