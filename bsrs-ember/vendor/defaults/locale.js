var BSRS_LOCALE_DEFAULTS_OBJECT = (function() {
    var factory = function() {};
    factory.prototype.defaults = function() {
        return {
            // one
            idOne: 'a7ae2835-ee7c-4604-92f7-045f3994936e',
            native_nameOne: '',
            localeOne: 'en',
            nameOne: 'English',
            nameOneKey: 'admin.locale.en',
            presentation_nameOne: '',
            rtlOne: false,
            defaultOne: true,
            // two
            idTwo: '51905ba8-024f-4739-ae5c-2d90ffc3f726',
            native_nameTwo: 'Español',
            localeTwo: 'es',
            nameTwo: 'Spanish',
            nameTwoKey: 'admin.locale.es',
            presentation_nameTwo: 'Español',
            rtlTwo: false,
            defaultTwo: false,
            // three
            idThree: '7f3afd8b-8f2b-43e0-879a-3b60f81388aa',
            native_nameThree: 'jp',
            localeThree: 'jp',
            nameThree: 'jp',
            presentation_nameThree: 'jp',
            rtlThree: false,
            defaultThree: false,
            // other
            idOther: '52f2e0eb-26a9-4588-9a09-ee9c812c594b',
            native_nameOther: 'en',
            localeOther: 'en',
            nameOther: 'en',
            presentation_nameOther: 'en',
            rtlOther: false,
            defaultOther: false,
            
            defaultPlaceholder: 'admin.locale.default'
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
