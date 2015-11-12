var BSRS_TICKET_ACTIVITY_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idAssigneeOne: '749447cc-1a19-4d8d-829b-bfb81cb5ece1',
            idAssigneeTwo: '749447cc-1a19-4d8d-829b-bfb81cb5ece2',
            idCreate: '649447cc-1a19-4d8d-829b-bfb81cb5ece1'
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_TICKET_ACTIVITY_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/ticket_activity', ['exports'], function (exports) {
        'use strict';
        return new BSRS_TICKET_ACTIVITY_DEFAULTS_OBJECT().defaults();
    });
}


