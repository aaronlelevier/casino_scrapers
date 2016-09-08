var BSRS_PHONE_NUMBER_TYPE_DEFAULTS_OBJECT = (function() {
  var factory = function() {};
  factory.prototype.defaults = function() {
    return {
      idOne: '2bff27c7-ca0c-463a-8e3b-6787dffbe7de',
      idTwo: '9416c657-6f96-434d-aaa6-0c867aff3270',
      officeId: '2bff27c7-ca0c-463a-8e3b-6787dffbe7de',
      officeName: 'admin.phonenumbertype.office',
      officeNameValue: 'Office',
      mobileId: '9416c657-6f96-434d-aaa6-0c867aff3270',
      mobileName: 'admin.phonenumbertype.mobile',
      mobileNameValue: 'Mobile'
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_PHONE_NUMBER_TYPE_DEFAULTS_OBJECT().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/phone-number-type', ['exports'], function(exports) {
    'use strict';
    return new BSRS_PHONE_NUMBER_TYPE_DEFAULTS_OBJECT().defaults();
  });
}