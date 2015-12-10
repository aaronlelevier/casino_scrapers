var BSRS_ADMIN_TRANSLATION_FACTORY = (function() {
    var factory = function(defaults, config) {
        this.defaults = defaults;
        this.config = config;
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
        var page_size = this.config.default.APP.PAGE_SIZE;
        for (var i=1; i <= page_size; i++) {
            translation = this.defaults.keyOne + i;
            response.push(translation);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b - a;
        });
        return {'count':page_size*2-1,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.list_two = function() {
        var page_size = this.config.default.APP.PAGE_SIZE;
        var response = [];
        for (var i=page_size+1; i <= page_size*2-1; i++) {
            translation = this.defaults.keyOne + i;
            response.push(translation);
        }
        return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function(i) {
        return this.get(this.defaults.keyOneGrid);
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
    var config = require('../config/environment');
    objectAssign(BSRS_ADMIN_TRANSLATION_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_ADMIN_TRANSLATION_FACTORY(translation_defaults, config);
} else {
    define('bsrs-ember/vendor/admin_translation_fixtures', ['exports', 'bsrs-ember/vendor/defaults/translation', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'], function (exports, translation_defaults, mixin, config) {
        'use strict';
        Object.assign(BSRS_ADMIN_TRANSLATION_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_ADMIN_TRANSLATION_FACTORY(translation_defaults, config);
        return {default: Factory};
    });
}
