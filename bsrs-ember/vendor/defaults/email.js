var BSRS_EMAIL_DEFAULTS_OBJECT = (function() { 
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '8435c17c-44eb-43be-9aa6-fd111a787b3t', 
      idTwo: '720fd29e-8e95-4e6e-9986-01bf17f4269b', 
      idThree: 'beabb30a-6b18-4256-a1d1-4c661c24c08c', 
      idPut: 'c2b6757b-2b08-48be-8034-d144d2958ce5', 
      emailOne: 'snewcomer@wat.com', 
      emailTwo: 'akrier@foo.com', 
      emailThree: 'alevier@bar.com'
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_EMAIL_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/email', ['exports'], function (exports) {
    'use strict';
    return new BSRS_EMAIL_DEFAULTS_OBJECT().defaults();
  });
}

