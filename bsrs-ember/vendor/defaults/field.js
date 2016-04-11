var BSRS_FIELDS_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'a12695d0-a82d-451f-a9c3-d87aaa47ac44',
      idTwo: 'a12695d0-a82d-451f-a9c3-d87aaa47ac45',
      idThree: 'a12695d0-a82d-451f-a9c3-d87aaa47ac46',
      labelOne: 'name',
      labelTwo: 'age',
      labelThree: 'address',
      typeOneValue: 'Text',
      typeTwoValue: 'Number',
      typeThreeValue: 'Textarea',
      typeFourValue: 'Select',
      typeFiveValue: 'With options',
      typeSixValue: 'Checkbox',
      typeSevenValue: 'File',
      typeEightValue: 'Asset select',
      typeNineValue: 'Check In',
      typeTenValue: 'Check Out',
      typeOne: 'admin.dtd.label.field.text',
      typeTwo: 'admin.dtd.label.field.number',
      typeThree: 'admin.dtd.label.field.textarea',
      typeFour: 'admin.dtd.label.field.select',
      typeFive: 'admin.dtd.label.field.checkbox',
      typeSix: 'admin.dtd.label.field.file',
      typeSeven: 'admin.dtd.label.field.asset_select',
      typeEight: 'admin.dtd.label.field.check_in',
      typeNine: 'admin.dtd.label.field.check_out',
      requiredOne: false,
      requiredTwo: true,
      orderOne: 0,
      orderTwo: 1,
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_FIELDS_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/field',
         ['exports'],
         function (exports) {
           'use strict';
           return new BSRS_FIELDS_DEFAULTS_OBJECT().defaults();
         });
}
