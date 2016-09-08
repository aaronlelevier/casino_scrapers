import Ember from 'ember';
const { computed, defineProperty } = Ember;
import { task, timeout } from 'ember-concurrency';

var ValidationComponentInit = Ember.Mixin.create({
  init() {
    this._super(...arguments);
    const valuePath = this.get('valuePath');
    defineProperty(this, 'attributeValidation', computed.oneWay(`model.validations.attrs.${valuePath}`));
    defineProperty(this, 'value', computed.alias(`model.${valuePath}`));
  },
});

var ValidationComponentPieces = Ember.Mixin.create({
  attributeValidation: null,
  classNameBindings: ['showMessage:invalid'],
  showMessage: computed('localDidValidate', 'focusedOut', function() {
    return this.get('localDidValidate') || this.get('focusedOut');
  }),
  localDidValidate: computed('didValidate', function() {
    // Create local didValidate boolean so that can show err msg right away on save and 
    // set back when fill in input
    return this.get('didValidate') && this.get('isInvalid');
  }),
  isValid: computed.oneWay('attributeValidation.isValid'),
  isInvalid: computed.oneWay('attributeValidation.isInvalid'),
});

export { ValidationComponentInit, ValidationComponentPieces } ;
