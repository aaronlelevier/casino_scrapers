var BSRS_automation_DEFAULTS_OBJECT = (function() {
  var factory = function(person) {
    this.person = person;
  };
  factory.prototype.defaults = function() {
    return {
      idZero: '1ee82b8c-89bd-45a2-8d57-5b920c8b0000',
      idOne: '1ee82b8c-89bd-45a2-8d57-5b920c8b0001',
      idTwo: '2cc82b8c-89bd-45a2-8d57-5b920c8b0002',
      idGridTwo: '1ee82b8c-89bd-45a2-8d57-5b920c8b0002',
      descriptionOne: 'foobar',
      descriptionTwo: 'barfoo',
      descriptionGridOne: 'foobar1',
      descriptionGridOneReverse: 'foobar10',
      assigneeOne: this.person.idOne,
      assigneeTwo: this.person.idTwo,
      assigneeSelectOne: '249543cf-8fea-426a-8bc3-09778cd78001',
      fullname: this.person.fullname,
      // fullnameOne: this.person.fullnameOne,
      // fullnameTwo: this.person.fullnameTwo,
      fullnameGridOne: this.person.fullname+"1",
      fullnameGridTen: this.person.fullname+"10",
      descriptionLastPage2Grid: 'foobar20',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var person = require('./person');
  module.exports = new BSRS_automation_DEFAULTS_OBJECT(person).defaults();
}
else {
  define('bsrs-ember/vendor/defaults/automation', ['exports', 'bsrs-ember/vendor/defaults/person'], function(exports, person) {
    'use strict';
    return new BSRS_automation_DEFAULTS_OBJECT(person).defaults();
  });
}
