var BSRS_PROVIDER_FACTORY = (function() {
  var factory = function(provider) {
    this.provider = provider['default'].defaults();
  };
  factory.prototype.generate = function(i) {
    var id = i || this.provider.idOne;
    return {
      id: id,
      name: this.provider.nameOne,
      logo: this.provider.logoOne,
      address1: this.provider.address1One,
      address2: this.provider.address2One,
      city: this.provider.cityOne,
      state: this.provider.stateOne,
      postal_code: this.provider.postalCodeOne,
      phone: this.provider.phoneOne,
      email: this.provider.emailOne,
    };
  };
  factory.prototype.list = function() {
    var response = [];
    for (var i=0; i <= 10; i++) {
      var rando_uuid = 'a7ae2835-ee7c-4604-92f7-045f399493x' + i;
      var provider = this.generate(rando_uuid);
      response.push(provider);
    }
    return {'count':10,'next':null,'previous':null,'results': response};
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var provider = require('./defaults/provider');
  module.exports = new BSRS_PROVIDER_FACTORY(provider);
}
else {
  define('bsrs-ember/vendor/provider_fixtures', ['exports', 'bsrs-ember/vendor/defaults/provider'],
    function(exports, provider) {
      'use strict';
      return new BSRS_PROVIDER_FACTORY(provider);
    }
  );
}
