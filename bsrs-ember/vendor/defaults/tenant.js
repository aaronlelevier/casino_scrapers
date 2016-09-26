var BSRS_TENANT_DEFAULTS_OBJECT = (function() {
  var factory = function(currency, dtd) {
    this.currency = currency;
    this.dtd = dtd;
  };
  factory.prototype.defaults = function() {
    return {
      idZero: '1ee82b8c-89bd-45a2-8d57-5b920c8b0000',
      idOne: '1ee82b8c-89bd-45a2-8d57-5b920c8b0001',
      idTwo: '2cc82b8c-89bd-45a2-8d57-5b920c8b0002',
      idGridTwo: '1ee82b8c-89bd-45a2-8d57-5b920c8b0002',
      companyNameOne: 'foobar',
      companyNameTwo: 'bizbaz',
      companyNameGridOne: 'foobar1',
      companyNameGridOneReverse: 'foobar10',
      companyNameLastPage2Grid: 'foobar20',
      currencyOne: this.currency.idOne,
      currencyTwo: this.currency.idTwo,
      currencySelectOne: this.currency.idBoy,
      name: this.currency.name,
      nameOne: this.currency.nameOne,
      nameGridOne: this.currency.name+'0',
      nameGridTen: this.currency.name+'9',
      
      // LEGACY
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
      inherits_from_role: 'role'
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var currency = require('./currency');
  var dtd = require('./dtd');
  module.exports = new BSRS_TENANT_DEFAULTS_OBJECT(currency, dtd).defaults();
}
else {
  define('bsrs-ember/vendor/defaults/tenant',
    ['exports', 'bsrs-ember/vendor/defaults/currency', 'bsrs-ember/vendor/defaults/dtd'], function(exports, currency, dtd) {
    'use strict';
    return new BSRS_TENANT_DEFAULTS_OBJECT(currency, dtd).defaults();
  });
}
