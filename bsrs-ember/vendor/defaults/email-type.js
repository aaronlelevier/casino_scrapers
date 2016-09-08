var BSRS_EMAIL_TYPE_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '60898078-dafe-4cf1-8aa5-867b0ebc5e2e',
      idTwo: 'c41834fb-7997-4a04-8f7e-f3b57b214c51',
      personalId: '60898078-dafe-4cf1-8aa5-867b0ebc5e2e',
      personalEmail: 'admin.emailtype.personal',
      personalName: 'Personal',
      workId: 'c41834fb-7997-4a04-8f7e-f3b57b214c51',
      workEmail: 'admin.emailtype.work',
      workName: 'Work'
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_EMAIL_TYPE_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/email-type', ['exports'], function (exports) {
    'use strict';
    return new BSRS_EMAIL_TYPE_DEFAULTS_OBJECT().defaults();
  });
}
