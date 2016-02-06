var DEFAULT_GENERIAL_SETTINGS = (function() {
    var factory = function() {};
    factory.prototype.defaults = function() {
        return {
            id: 'b783a238-1131-4623-8d24-81a672bb4e00',
            name: 'general',
            settings: {
                'login_grace': {
                    'required': true,
                    'type': 'int',
                    'value': 1
                },
                'welcome_text': {
                    'required': false,
                    'type': 'str',
                    'value': 'Welcome'
                },
                'company_name': {
                    'required': false,
                    'type': 'str',
                    'value': 'Andys Pianos'
                },
                'create_all': {
                    'required': true,
                    'type': 'bool',
                    'value': true
                }
            }
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new DEFAULT_GENERIAL_SETTINGS().defaults();
} else {
    define('bsrs-ember/vendor/defaults/setting', ['exports'],
        function(exports) {
            'use strict';
            return new DEFAULT_GENERIAL_SETTINGS().defaults();
        });
}