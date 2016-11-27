var BSRS_TAB_DEFAULTS_OBJECT = (function() {
    var factory = function() {};
    factory.prototype.defaults = function() {
        return {
            // one
            id_one: 'a7ae2835-ee7c-4604-92f7-045f3994936e',
            typeOne: 'single',
            typeTwo: 'multiple',
            module_one: 'ticket',
            routeName_one: 'tickets.index.ticket',
            templateModelField_one: 'categories',
            redirect_one: 'tickets.index',
            newModel_one: false,
            // two
            id_two:     'f4e7f207-1d75-456a-9c6a-52241741dfd3',
            id_three:   '737d1754-f736-47c7-bf3e-f02ec1606125',
            id_four:    '1860c241-5c34-4992-b4d8-667615fc9808',
            id_five:    'bcd76384-d42c-4c76-b5f7-0c8f7f9807d4',
            id_six:     '0fd32933-1031-4e3b-9726-96652cdd8289',
            id_seven:   'e80ce170-dd29-4883-838d-d3d1c6f8cab8',
            id_eight:   '808fde0a-b986-433b-8614-a66de2325149'

        }
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_TAB_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/tab', ['exports'], function (exports) {
        'use strict';
        return new BSRS_TAB_DEFAULTS_OBJECT().defaults();
    });
}
