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
  isValid: computed.oneWay('attributeValidation.isValid'),
  isInvalid: computed.oneWay('attributeValidation.isInvalid'),
});

var ValidationComponentPieces = Ember.Mixin.create({
  attributeValidation: null,
  showMessage: false,
  invalidClass: false,
  /**
   * @proprety focused
   * if focused, then show validation message.  User may type, focus out and msg still shows b/c of timeout in place
   */
  focused: false,
  classNameBindings: ['invalidClass:invalid'],
});

export { ValidationComponentInit, ValidationComponentPieces } ;
