var BSRS_EMAIL_TYPE_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            personalId: '2bff27c7-ca0c-463a-8e3b-6787dffbe7wt',
            personalEmail: 'admin.emailtype.personal',
            workId: '9416c657-6f96-434d-aaa6-0c867aff3291',
            workEmail: 'admin.emailtype.work'
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_EMAIL_TYPE_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/email-type', ['exports'], function (exports) {
        'use strict';
        return new BSRS_EMAIL_TYPE_DEFAULTS_OBJECT().defaults();
    });
}
