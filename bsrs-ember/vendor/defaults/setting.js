var DEFAULT_GENERIAL_SETTINGS = (function() {
    var factory = function(dtd) {
        this.dtd = dtd;
    };
    factory.prototype.defaults = function() {
        var base = {
            // Initial
            company_code: 'one',
            company_name: 'Andys Pianos',
            dashboard_text: 'Welcome',
            login_grace: 1,
            tickets_module: true,
            work_orders_module: true,
            invoices_module: true,
            test_mode: false,
            test_contractor_email: 'test@bigskytech.com',
            test_contractor_phone: '+18587155000',
            dt_start_id: this.dtd.idOne,
            dt_start_key: 'Start',
            // Initial Role
            create_all: true,
            accept_assign: false,
            accept_notify: false,
            password_one_time: false,

            // Other
            company_codeOther: 'two',
            company_nameOther: 'Bobs Pianos',
            dashboard_textOther: '1234',
            login_graceOther: 2,
            tickets_moduleOther: false,
            work_orders_moduleOther: false,
            invoices_moduleOther: false,
            test_modeOther: true,
            test_contractor_emailOther: 'foo@bigskytech.com',
            test_contractor_phoneOther: '+18587154000',
            dt_start_idOther: this.dtd.idTwo,
            dt_start_keyOther: 'StartTwo',
            // Other Role
            create_allOther: false,
            accept_assignOther: true,
            accept_notifyOther: true,
            password_one_timeOther: true,

            // Misc.
            inherits_from_general: 'general',
            inherits_from_role: 'role',
        };
        return Object.assign(base, {
            id: 'b783a238-1131-4623-8d24-81a672bb4e00',
            name: 'general',
            title: 'admin.setting.name.general',
            settings: {
                company_code: {
                    value: base.company_code
                },
                company_name: {
                    value: base.company_name
                },
                dashboard_text: {
                    value: base.dashboard_text
                },
                login_grace: {
                    value: base.login_grace
                },
                tickets_module: {
                    value: base.tickets_module,
                },
                work_orders_module: {
                    value: base.work_orders_module,
                },
                invoices_module: {
                    value: base.invoices_module,
                },
                test_mode: {
                    value: base.test_mode,
                },
                test_contractor_email: {
                    value: base.test_contractor_email,
                },
                test_contractor_phone: {
                    value: base.test_contractor_phone,
                },
                dt_start_id: {
                    value: base.dt_start_id,
                },
                dt_start: {
                    value: {
                        id: base.dt_start_id,
                        key: base.dt_start_key
                    }
                }
            },
            settingsOther: {
                company_code: {
                    value: base.company_codeOther
                },
                company_name: {
                    value: base.company_nameOther
                },
                dashboard_text: {
                    value: base.dashboard_textOther
                },
                login_grace: {
                    value: base.login_graceOther
                },
                tickets_module: {
                    value: base.tickets_moduleOther,
                },
                work_orders_module: {
                    value: base.work_orders_moduleOther,
                },
                invoices_module: {
                    value: base.invoices_moduleOther,
                },
                test_mode: {
                    value: base.test_modeOther,
                },
                test_contractor_email: {
                    value: base.test_contractor_emailOther,
                },
                test_contractor_phone: {
                    value: base.test_contractor_phoneOther,
                },
                dt_start_id: {
                    value: base.dt_start_idOther,
                },
                dt_start: {
                    value: {
                        id: base.dt_start_idOther,
                        key: base.dt_start_keyOther
                    }
                }
            }
        });
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var dtd = require('./dtd');
    module.exports = new DEFAULT_GENERIAL_SETTINGS(dtd).defaults();
} else {
    define('bsrs-ember/vendor/defaults/setting',
        ['exports', 'bsrs-ember/vendor/defaults/dtd'],
        function(exports, dtd) {
            'use strict';
            return new DEFAULT_GENERIAL_SETTINGS(dtd).defaults();
        });
}
