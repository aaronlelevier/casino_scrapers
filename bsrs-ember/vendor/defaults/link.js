var BSRS_LINKS_DEFAULTS_OBJECT = (function() {
    var factory = function(priority_defaults) {
        this.priority_defaults = priority_defaults;
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 'a44695d0-a82d-451f-a9c3-d87aaa47ac44',
            idTwo: 'aae202c7-7f38-4e42-8e18-09ecc06ed046',
            idThree: 'add6eeea-c2f8-4f66-8fbf-af28d28c801b',
            orderOne: 1,
            orderTwo: 2,
            action_buttonOne: true,
            action_buttonTwo: false,
            is_headerOne: true,
            is_headerTwo: false,
            requestOne: 'help',
            requestTwo: 'broken',
            textOne: 'next',
            textTwo: 'finished',
            priorityOne: this.priority_defaults.priorityOneId,
            priorityTwo: this.priority_defaults.priorityTwoId
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var priority_defaults = require('./ticket-priority');
    module.exports = new BSRS_LINKS_DEFAULTS_OBJECT(priority_defaults).defaults();
} else {
    define('bsrs-ember/vendor/defaults/link', ['exports', 'bsrs-ember/vendor/defaults/ticket-priority'], function (exports, priority_defaults) {
        'use strict';
        return new BSRS_LINKS_DEFAULTS_OBJECT(priority_defaults).defaults();
    });
}

