var DEFAULT_GENERIAL_TENANT = (function() {
  var factory = function(dtd, currency) {
    this.dtd = dtd;
    this.currency = currency;
  };
  factory.prototype.defaults = function() {
    return {
      // Initial
      id: '63774987-65d2-4475-b998-091059c90e10',
      company_code: 'one',
      company_name: 'Andys Pianos',
      dashboard_text: '# Welcome',
      login_grace: 1,
      tickets_module: true,
      work_orders_module: true,
      invoices_module: true,
      test_mode: false,
      test_contractor_email: 'test@bigskytech.com',
      test_contractor_phone: '+18587155000',
      dt_start_id: this.dtd.idOne,
      dt_start_key: 'Start',
      default_currency_id: this.currency.id,
      // Initial Role
      create_all: true,
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
      default_currency_idOther: this.currency.idCAD,
      // Other Role
      create_allOther: false,
      password_one_timeOther: true,

      // Misc.
      inherits_from_general: 'general',
      inherits_from_role: 'role',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var dtd = require('./dtd');
  var currency = require('./currencies');
  module.exports = new DEFAULT_GENERIAL_TENANT(dtd, currency).defaults();
}
else {
  define('bsrs-ember/vendor/defaults/tenant', ['exports',
      'bsrs-ember/vendor/defaults/dtd',
      'bsrs-ember/vendor/defaults/currencies'
    ],
    function(exports, dtd, currency) {
      'use strict';
      return new DEFAULT_GENERIAL_TENANT(dtd, currency).defaults();
    });
}
