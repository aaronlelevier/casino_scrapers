var DEFAULT_GENERIAL_SETTINGS = (function() {
    var factory = function() {};
    factory.prototype.defaults = function() {
        var one = {
            login_grace: 1,
            welcome_text: 'Welcome',
            company_name: 'Andys Pianos',
            create_all: true,
        };
        var other = {
            login_graceOther: 2,
            welcome_textOther: '1234',
            company_nameOther: 'Bobs Pianos',
            create_allOther: false
        };
        return Object.assign(one, other, {
            id: 'b783a238-1131-4623-8d24-81a672bb4e00',
            name: 'general',
            title: 'admin.general.other',
            'settings': {
                'login_grace': {
                    'required': true,
                    'type': 'int',
                    'value': one.login_grace
                },
                'welcome_text': {
                    'required': false,
                    'type': 'str',
                    'value': one.welcome_text
                },
                'company_name': {
                    'required': false,
                    'type': 'str',
                    'value': one.company_name
                },
                'create_all': {
                    'required': true,
                    'type': 'bool',
                    'value': one.create_all
                }
            },
            'settingsOther': {
                'login_grace': {
                    'required': true,
                    'type': 'int',
                    'value': other.login_graceOther
                },
                'welcome_text': {
                    'required': false,
                    'type': 'str',
                    'value': other.welcome_textOther
                },
                'company_name': {
                    'required': false,
                    'type': 'str',
                    'value': other.company_nameOther
                },
                'create_all': {
                    'required': true,
                    'type': 'bool',
                    'value': other.create_allOther
                }
            }
        });
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