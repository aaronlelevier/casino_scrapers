var BSRS_WO_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'a7ae2835-ee7c-4604-92f7-045f399493xx',
      idTwo: '62a957f1-6bdc-447b-ac33-1e18c23b32dd',
      unusedId: '86a957f1-6bdc-447b-ac33-1e18c23b32dd',
      costEstimateOne: '350.00',
      costEstimateTwo: '500.14',
      approvedAmount: '300.00',
      scheduledDateOne: new Date(),
      scheduledDateTwo: new Date(),
      completedDateOne: new Date(),
      completedDateTwo: new Date(),
      expirationDateOne: new Date(),
      expirationDateTwo: new Date(),
      approvalDateOne: new Date(),
      approvalDateTwo: new Date(),
      trackingNumberOne: '86a957f16bdc447bac331e18c23b32dd',
      providerNameOne: 'Bobs Construction',
      providerNameTwo: 'Charlies Construction',
      providerLogoOne: 'http://pngimg.com/upload/cat_PNG1631.png',
      providerLogoTwo: 'http://pngimg.com/upload/cat_PNG1631.png',
      providerAddress1One: 'Colorado Way',
      providerAddress1Two: 'Market Way',
      providerAddress2One: 'Unit 12',
      providerCityOne: 'San Diego',
      providerStateOne: 'CA',
      providerPostalCodeOne: '92126',
      providerPhoneOne: '+18005550239',
      providerEmailOne: 'bob@bconstruction',
      statusOne: 'work_order.status.new',
      glCodeOne: 'kjhskjhdkjds',
      trackingNumberOne: 'klwjhw98dudkjd55',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports['default'] = new BSRS_WO_DEFAULTS_OBJECT();
} else {
  define('bsrs-ember/vendor/defaults/work-order', ['exports'], function (exports) {
    'use strict';
    var wo = new BSRS_WO_DEFAULTS_OBJECT();
    exports.default = wo;
  });
}
