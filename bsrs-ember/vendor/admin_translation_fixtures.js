var BSRS_ADMIN_TRANSLATION_FACTORY = (function() {
    var factory = function(defaults) {
        this.defaults = defaults;
    };
    factory.prototype.get = function(i, name) {
        var name = name || this.defaults.storeName;
        return {
            id: i || this.defaults.idOne,
            key: this.defaults.keyOne,
            helper: this.defaults.helperOne,
            locales: [
                {
                    locale: this.defaults.localeOneId,
                    translation: this.defaults.localeOneTranslation,
                    helper: this.defaults.localeOneHelper
                },{
                    locale: this.defaults.localeTwoId,
                    translation: this.defaults.localeTwoTranslation,
                    helper: this.defaults.localeTwoHelper
                },{
                    locale: this.defaults.localeThreeId,
                    translation: this.defaults.localeThreeTranslation,
                    helper: this.defaults.localeThreeHelper
                }
            ]
        }
    },
    factory.prototype.generate = function(i) {
        var id = i || this.defaults.idOne;
        return {
            id: id,
            key : this.defaults.keyOne,
            helper: this.defaults.helperOne
        }
    };
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 10; i++) {
            var uuid = '6f771284-6d7d-4854-9125-39bf0cb6ab75';
            if (i < 10) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            var translation = this.generate(uuid);
            translation.key = translation.key + i;
            response.push(translation);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':19,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.list_two = function() {
        var response = [];
        for (var i=11; i <= 19; i++) {
            var uuid = '6f771284-6d7d-4854-9125-39bf0cb6ab75';
            var translation = this.generate(uuid + i);
            translation.key = 'wat.foo' + i;
            response.push(translation);
        }
        return {'count':19,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function(i) {
        return this.get(this.defaults.idOne);
    };
    factory.prototype.put = function(translation) {
        var response = this.generate(translation.id);
        for(var key in translation) {
            response[key] = translation[key];
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
