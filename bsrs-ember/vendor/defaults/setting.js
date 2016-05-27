var DEFAULT_GENERIAL_SETTINGS = (function() {
    var factory = function() {};
    factory.prototype.defaults = function() {
        var one = {
            company_code: 'one',
            company_name: 'Andys Pianos',
            dashboard_text: 'Welcome',
            login_grace: 1,
            exchange_rates: 1.0,
            modules: [],
            test_mode: false,
            test_contractor_email: 'test@bigskytech.com',
            test_contractor_phone: '+18587155000',
            dt_start_key: 'Start',

            // Role
            create_all: true,
            accept_assign: false,
            accept_notify: false
        };
        var other = {
            company_codeOther: 'two',
            company_nameOther: 'Bobs Pianos',
            dashboard_textOther: '1234',
            login_graceOther: 2,
            exchange_ratesOther: 1.0,
            modulesOther: ['foo'],
            test_modeOther: true,
            test_contractor_emailOther: 'foo@bigskytech.com',
            test_contractor_phoneOther: '+18587154000',
            dt_start_keyOther: 'StartTwo',

            create_allOther: false,
            accept_assignOther: true,
            accept_notifyOther: true
        };
        var misc = {
            inherits_from_general: 'general'
        };
        return Object.assign(one, other, misc, {
            id: 'b783a238-1131-4623-8d24-81a672bb4e00',
            name: 'general',
            title: 'admin.setting.name.general',
            settings: {
                company_code: {
                    type: 'str',
                    value: one.company_code
                },
                company_name: {
                    type: 'str',
                    value: one.company_name
                },
                dashboard_text: {
                    type: 'str',
                    value: one.dashboard_text
                },
                login_grace: {
                    type: 'int',
                    value: one.login_grace
                },
                exchange_rates: {
                    type: 'float',
                    value: one.exchange_rates
                },
                modules: {
                    value: one.modules,
                    type: 'list',
                },
                test_mode: {
                    value: one.test_mode,
                    type: 'bool',
                },
                test_contractor_email: {
                    value: one.test_contractor_email,
                    type: 'email',
                },
                test_contractor_phone: {
                    value: one.test_contractor_phone,
                    type: 'phone',
                },
                dt_start_key: {
                    value: one.dt_start_key,
                    type: 'str',
                }
            },
            settingsOther: {
                company_code: {
                    type: 'str',
                    value: one.company_codeOther
                },
                company_name: {
                    type: 'str',
                    value: other.company_nameOther
                },
                dashboard_text: {
                    type: 'str',
                    value: other.dashboard_textOther
                },
                login_grace: {
                    type: 'int',
                    value: other.login_graceOther
                },
                exchange_rates: {
                    type: 'float',
                    value: one.exchange_ratesOther
                },
                modules: {
                    value: one.modulesOther,
                    type: 'list',
                },
                test_mode: {
                    value: one.test_modeOther,
                    type: 'bool',
                },
                test_contractor_email: {
                    value: one.test_contractor_emailOther,
                    type: 'email',
                },
                test_contractor_phone: {
                    value: one.test_contractor_phoneOther,
                    type: 'phone',
                },
                dt_start_key: {
                    value: one.dt_start_keyOther,
                    type: 'str',
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