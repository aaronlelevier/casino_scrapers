var BSRS_LOCALE_TRANSLATION_DEFAULTS_OBJECT = (function() {
    var factory = function(locale, translation) {
        this.locale = locale;
        this.translation = translation;
    };
    factory.prototype.defaults = function() {
        return {
            // one
            idOne: this.locale.idOne + ":" + this.translation.keyOneGrid,
            localeOne: this.locale.idOne,
            translationOne: this.translation.localeOneTranslation,
            // two
            idTwo: this.locale.idTwo + ":" + this.translation.keyTwoGrid,
            localeTwo: this.locale.idTwo,
            translationTwo: this.translation.localeTwoTranslation,
            // other
            idThree: this.locale.idOther + ":" + this.translation.keyThreeGrid,
            localeThree: this.locale.idOther,
            translationThree: this.translation.localeThreeTranslation,
        }
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var locale = require('./locale');
    var translation = require('./translation');
    module.exports = new BSRS_LOCALE_TRANSLATION_DEFAULTS_OBJECT(locale, translation).defaults();
} else {
    define('bsrs-ember/vendor/defaults/locale-translation',
        ['exports', 'bsrs-ember/vendor/defaults/locale', 'bsrs-ember/vendor/defaults/translation'],
        function (exports, locale, translation) {
        'use strict';
        return new BSRS_LOCALE_TRANSLATION_DEFAULTS_OBJECT(locale, translation).defaults();
    });
}
