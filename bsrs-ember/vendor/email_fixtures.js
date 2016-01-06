var BSRS_EMAIL_FACTORY = (function() {
    var factory = function(email_defaults, email_type_defaults) {
        this.email_type_defaults = email_type_defaults;
        this.email_defaults = email_defaults;
    };
    factory.prototype.get = function() {
        return [{
            'id':this.email_defaults.idOne,
            'email':this.email_defaults.emailOne,
            'type': this.email_type_defaults.workId,
        },
        {
            'id':this.email_defaults.idTwo,
            'email':this.email_defaults.emailTwo,
            'type': this.email_type_defaults.personalId,
        }];
    };
    factory.prototype.put = function(email) {
        var emails = this.get();
        if(!email) {
            return emails;
        }
        emails.forEach(function(model) {
            if(model.id === email.id) {
                for (var attr in email) {
                    model[attr] = email[attr];
                }
            }
        });
        return emails;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var email_defaults = require('./defaults/email');
    var email_type_defaults = require('./defaults/email-type');
    module.exports = new BSRS_EMAIL_FACTORY(email_defaults, email_type_defaults);
} else {
    define('bsrs-ember/vendor/email_fixtures', ['exports', 'bsrs-ember/vendor/defaults/email', 'bsrs-ember/vendor/defaults/email-type'], function (exports, email_defaults, email_type_defaults) {
        'use strict';
        return new BSRS_EMAIL_FACTORY(email_defaults, email_type_defaults);
    });
}
