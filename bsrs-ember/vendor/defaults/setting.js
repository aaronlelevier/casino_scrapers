var DEFAULT_GENERIAL_SETTINGS = (function() {
    var factory = function() {};
    factory.prototype.defaults = function() {
        var one = {
            company_code: 'one',
            company_name: 'Andys Pianos',
            dashboard_text: 'Welcome',
            login_grace: 1,
            modules: {
                tickets: true,
                work_orders: true,
                invoices: true
            },
            test_mode: false,
            test_contractor_email: 'test@bigskytech.com',
            test_contractor_phone: '+18587155000',
            dt_start_id: 'Start',

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
            modulesOther: {
                tickets: false,
                work_orders: false,
                invoices: false
            },
            test_modeOther: true,
            test_contractor_emailOther: 'foo@bigskytech.com',
            test_contractor_phoneOther: '+18587154000',
            dt_start_idOther: 'StartTwo',

            // Role
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
                    value: one.company_code
                },
                company_name: {
                    value: one.company_name
                },
                dashboard_text: {
                    value: one.dashboard_text
                },
                login_grace: {
                    value: one.login_grace
                },
                modules: {
                    value: one.modules,
                },
                test_mode: {
                    value: one.test_mode,
                },
                test_contractor_email: {
                    value: one.test_contractor_email,
                },
                test_contractor_phone: {
                    value: one.test_contractor_phone,
                },
                dt_start_id: {
                    value: one.dt_start_id,
                }
            },
            settingsOther: {
                company_code: {
                    value: one.company_codeOther
                },
                company_name: {
                    value: other.company_nameOther
                },
                dashboard_text: {
                    value: other.dashboard_textOther
                },
                login_grace: {
                    value: other.login_graceOther
                },
                modules: {
                    value: one.modulesOther,
                },
                test_mode: {
                    value: one.test_modeOther,
                },
                test_contractor_email: {
                    value: one.test_contractor_emailOther,
                },
                test_contractor_phone: {
                    value: one.test_contractor_phoneOther,
                },
                dt_start_id: {
                    value: one.dt_start_idOther,
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