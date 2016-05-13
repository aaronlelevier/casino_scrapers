var BSRS_DTD_DEFAULTS_OBJECT = (function() { 
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '9435c17c-42eb-43be-9aa6-ed111a787b01', 
      idTwo: '9435c17c-42eb-43be-9aa6-ed111a787b02', 
      idThree: '9435c17c-42eb-43be-9aa6-ed111a787b03', 
      idPut: 'c2b6757b-2b08-48be-8034-d144d2958ce9', 
      idGridTwo: 'cf2b9c85-f6bd-4345-9834-e5d22ap05p12',
      keyOne: '1.1.1',
      keyTwo: '1.2.11',
      keySearchFiveOne: '1.2.15',
      keySearchFiveTwo: '1.1.5',
      keySearch14: '1.2.14',
      keySearch13: '1.2.13',
      keyFullText: '1.1.3',
      descriptionStart: 'Start',
      descriptionOne: 'Please select an option below',
      descriptionTwo: 'You are done',
      promptOne: 'Did this solve the problem?',
      promptTwo: 'Do you need anything?',
      noteOne: 'Make sure to check the breakers',
      noteTwo: 'Good to go',
      noteTypeOneValue: 'Success',
      noteTypeTwoValue: 'Warning',
      noteTypeThreeValue: 'Info',
      noteTypeOne: 'admin.dtd.note_type.success',
      noteTypeTwo: 'admin.dtd.note_type.warning',
      noteTypeThree: 'admin.dtd.note_type.info',
      noteTypeFour: 'admin.dtd.note_type.danger',
      linkTypeOne: 'admin.dtd.link_type.buttons',
      linkTypeTwo: 'admin.dtd.link_type.links',
      attachmentOneId: '40f530c4-ce6c-4724-9cfd-37a16e787001',
      attachmentTwoId: '40f530c4-ce6c-4724-9cfd-37a16e787002',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_DTD_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/dtd', ['exports'], function (exports) {
    'use strict';
    return new BSRS_DTD_DEFAULTS_OBJECT().defaults();
  });
}

