var BSRS_TRANSLATION_DEFAULTS_OBJECT = (function() {
    var factory = function() {};
    factory.prototype.defaults = function() {
        return {
            idOne: '6f771284-6d7d-4854-9125-39bf0cb6ab75',
            idTwo: '55971570-eb5b-427b-afaa-f4d269e87c9e',
            idThree: '335eb805-869f-43f9-bc6c-b955374e42f6',
            keyOne: 'home.welcome',
            keyOneGrid: 'home.welcome1',
            keyTwoGrid: 'home.welcome2',
            keyTwo: 'home.hello',
            keyThree: 'home.goodbye',
            helperOne: 'home.welcome.helper',
            helperTwo: 'home.hello.helper',
            helperThree: 'home.goodbye.helper',
            //TODO: Need to look up real locale ids
            localeOneId: '1d4396a9-b91e-471b-91a0-c3e2440ae93b',
            localeOneTranslation: 'Welcome',
            localeOneHelper: 'Welcomes people to the site',
            localeTwoId: 'b990d583-eb4f-41f0-a7b0-9fd5a0efc4f1',
            localeTwoTranslation: 'Bienvenido',
            localeTwoHelper: 'Acoge con satisfacción la gente al sitio',
            localeThreeId: 'fe0a7aa5-54b0-4bb1-a79d-bc22621562ec',
            localeThreeTranslation: '欢迎',
            localeThreeHelper: '欢迎人们到现场',
            localeOtherId: 'fe0a7aa5-54b0-4bb1-a79d-bc22621562aa',
            localeOtherTranslation: 'Moshi Moshi',
            localeOtherHelper: "Moshi y'all",
            // alternate translations
            otherTranslationOne: 'goodbye',
            otherTranslationTwo: 'adios'
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_TRANSLATION_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/translation', ['exports'], function (exports) {
        'use strict';
        return new BSRS_TRANSLATION_DEFAULTS_OBJECT().defaults();
    });
}