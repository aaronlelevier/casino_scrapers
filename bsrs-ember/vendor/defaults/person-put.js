var BSRS_PERSON_PUT_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            id: '263126de-5fzx-315a-8bc3-09778cd78841',
            username: 'llcoolj',
            first_name: 'Ice',
            middle_initial: 'F\'in',
            last_name: 'Cube',
            emp_number: '1122',
            auth_amount: {currency: '535543wf-80ea-426a-8cc3-09728cd74952', amount: '0.000'},
            title: 'mastermind',
        };
    };
    return factory;
})();


if (typeof window === 'undefined') {
    module.exports = new BSRS_PERSON_PUT_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/person-put', ['exports'], function (exports) {
        'use strict';
        return new BSRS_PERSON_PUT_DEFAULTS_OBJECT().defaults();
    });
}
