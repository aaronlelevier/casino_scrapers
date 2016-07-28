var BSRS_<%= CapitalizeModule %>_DEFAULTS_OBJECT = (function() {
  var factory = function(<%= secondModelCamel %>) {
    this.<%= secondModelCamel %> = <%= secondModelCamel %>;
  };
  factory.prototype.defaults = function() {
    return {
      idZero: '1ee82b8c-89bd-45a2-8d57-5b920c8b0000',
      idOne: '1ee82b8c-89bd-45a2-8d57-5b920c8b0001',
      idTwo: '2cc82b8c-89bd-45a2-8d57-5b920c8b0002',
      idGridTwo: '1ee82b8c-89bd-45a2-8d57-5b920c8b0002',
      <%= firstPropertyCamel %>One: 'foo',
      <%= firstPropertyCamel %>Two: 'bar',
      <%= firstPropertyCamel %>GridOne: 'foo1',
      <%= firstPropertyCamel %>GridOneReverse: 'foo10',
      <%= secondPropertyCamel %>One: this.<%= secondModelCamel %>.idOne,
      <%= secondPropertyCamel %>Two: this.<%= secondModelCamel %>.idTwo,
      <%= secondPropertyCamel %>SelectOne: this.<%= secondModelCamel %>.idBoy,
      <%= secondModelDisplayCamel %>: this.<%= secondModelCamel %>.<%= secondModelDisplayCamel %>,
      <%= secondModelDisplayCamel %>One: this.<%= secondModelCamel %>.<%= secondModelDisplayCamel %>One,
      <%= secondModelDisplayCamel %>Two: this.<%= secondModelCamel %>.<%= secondModelDisplayCamel %>Two,
      <%= secondModelDisplayCamel %>GridOne: this.<%= secondModelCamel %>.<%= secondModelDisplaySnake %>+'1',
      <%= secondModelDisplayCamel %>GridTen: this.<%= secondModelCamel %>.<%= secondModelDisplaySnake %>+'10',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var <%= secondModelCamel %> = require('./<%= secondModel %>');
  module.exports = new BSRS_<%= CapitalizeModule %>_DEFAULTS_OBJECT(<%= secondModelCamel %>).defaults();
}
else {
  define('bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>', ['exports', 'bsrs-ember/vendor/defaults/<%= secondModel %>'], function(exports, <%= secondModelCamel %>) {
    'use strict';
    return new BSRS_<%= CapitalizeModule %>_DEFAULTS_OBJECT(<%= secondModelCamel %>).defaults();
  });
}
