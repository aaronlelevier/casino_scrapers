var BSRS_ADMIN_TRANSLATION_FACTORY = (function() {
    var factory = function(defaults) {
        this.defaults = defaults;
    };
    factory.prototype.get = function(i) {
        // var name = name || this.defaults.storeName;
        return {
            id: i || this.defaults.keyOneGrid,
            key: this.defaults.keyOneGrid,
            locales: [
                {
                    locale: this.defaults.localeOneId,
                    translation: this.defaults.localeOneTranslation
                },{
                    locale: this.defaults.localeTwoId,
                    translation: this.defaults.localeTwoTranslation
                },{
                    locale: this.defaults.localeThreeId,
                    translation: this.defaults.localeThreeTranslation
                }
            ]
        }
    },
    factory.prototype.generate = function(i) {
        var id = i || this.defaults.idOne;
        return {
            id: id,
            key : this.defaults.keyOne
        }
    };
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 10; i++) {
            translation = this.defaults.keyOne + i;
            response.push(translation);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b - a;
        });
        return {'count':19,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.list_two = function() {
        var response = [];
        for (var i=11; i <= 19; i++) {
            translation = this.defaults.keyOne + i;
            response.push(translation);
        }
        return {'count':19,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function(i) {
        return this.get(this.defaults.idOne);
    };
    factory.prototype.put = function(translation) {
        var response = this.get(translation.id);
        // update top level key:values
        for(var key in translation) {
            response[key] = translation[key];
        }
        // update nested locales
        for(var x in translation.locales) {
            for(var y in translation.locales[x]) {
                response.locales[x][y] =  translation.locales[x][y];
            }
        }
        return response;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var objectAssign = require('object-assign');
    var mixin = require('../vendor/mixin');
    var translation_defaults = require('../vendor/defaults/translation');
    objectAssign(BSRS_ADMIN_TRANSLATION_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_ADMIN_TRANSLATION_FACTORY(translation_defaults);
} else {
    define('bsrs-ember/vendor/admin_translation_fixtures', ['exports', 'bsrs-ember/vendor/defaults/translation', 'bsrs-ember/vendor/mixin'], function (exports, translation_defaults, mixin) {
        'use strict';
        Object.assign(BSRS_ADMIN_TRANSLATION_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_ADMIN_TRANSLATION_FACTORY(translation_defaults);
        return {default: Factory};
    });
}
