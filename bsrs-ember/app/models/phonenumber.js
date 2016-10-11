import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConf from 'bsrs-ember/mixins/optconfigure/phonenumber';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  number: validator('format', { 
    type: 'phone',
    message: 'errors.phonenumber.number'
  }),
});

var PhoneNumberModel = Model.extend(Validations, OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('phone_number_type', 'phonenumber');
  },
  simpleStore: Ember.inject.service(),
  number: attr(''),
  phone_number_type_fk: undefined,
  // model_fk: undefined,
  invalid_number: Ember.computed('number', function() {
    let number = this.get('number');
    return typeof number === 'undefined' || number.trim() === '';
  }),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'phoneNumberTypeIsDirty', function() {
    return this.get('isDirty') || this.get('phoneNumberTypeIsDirty');
  }).readOnly(),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  saveRelated() {
    this.savePhoneNumberType();
  },
  rollback() {
    this.rollbackPhoneNumberType();
    this._super(...arguments);
  },
  serialize() {
    return {
      id: this.get('id'),
      number: this.get('number'),
      type: this.get('phone_number_type.id')
    };
  }
});

export default PhoneNumberModel;
