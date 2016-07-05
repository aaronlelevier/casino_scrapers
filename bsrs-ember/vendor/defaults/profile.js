var BSRS_PROFILE_DEFAULTS_OBJECT = (function() {
  var factory = function(person) {
    this.person = person;
  };
  factory.prototype.defaults = function() {
    return {
      idZero: '1ee82b8c-89bd-45a2-8d57-5b920c8b0000',
      idOne: '1ee82b8c-89bd-45a2-8d57-5b920c8b0001',
      idTwo: '2cc82b8c-89bd-45a2-8d57-5b920c8b0002',
      descOne: 'foo',
      descTwo: 'bar',
      assigneeOne: this.person.idOne,
      assigneeTwo: this.person.idTwo,
      username: this.person.username,
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var person = require('./person');
  module.exports = new BSRS_PROFILE_DEFAULTS_OBJECT(person).defaults();
}
else {
  define('bsrs-ember/vendor/defaults/profile', ['exports', 'bsrs-ember/vendor/defaults/person'], function(exports, person) {
    'use strict';
    return new BSRS_PROFILE_DEFAULTS_OBJECT(person).defaults();
  });
}