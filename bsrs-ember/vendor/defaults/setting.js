var DEFAULT_GENERIAL_SETTINGS = (function() {
    var factory = function() {};
    factory.prototype.defaults = function() {
        var one = {
            login_grace: 1,
            dashboard_text: 'Welcome',
            company_name: 'Andys Pianos',
            create_all: true,
        };
        var other = {
            login_graceOther: 2,
            dashboard_textOther: '1234',
            company_nameOther: 'Bobs Pianos',
            create_allOther: false
        };
        return Object.assign(one, other, {
            id: 'b783a238-1131-4623-8d24-81a672bb4e00',
            name: 'general',
            title: 'admin.general.other',
            'settings': {
                'login_grace': {
                    'type': 'int',
                    'value': one.login_grace
                },
                'dashboard_text': {
                    'type': 'str',
                    'value': one.dashboard_text
                },
                'company_name': {
                    'type': 'str',
                    'value': one.company_name
                }
            },
            'settingsOther': {
                'login_grace': {
                    'type': 'int',
                    'value': other.login_graceOther
                },
                'dashboard_text': {
                    'type': 'str',
                    'value': other.dashboard_textOther
                },
                'company_name': {
                    'type': 'str',
                    'value': other.company_nameOther
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