import Ember from 'ember';
const { computed, defineProperty } = Ember;
import { ValidationComponentInit, ValidationComponentPieces } from 'bsrs-ember/mixins/validation-component';

/*
* didValidate - trigger showMessage and can show mwwage if
*/
export default Ember.Component.extend(ValidationComponentInit, ValidationComponentPieces, {
  type: 'text',
  // attributevalidation: null,
  // classNameBindings: ['showMessage:invalid'],
  // init() {
  //   this._super(...arguments);
  //   const valuePath = this.get('valuePath');
  //   defineProperty(this, 'attributeValidation', computed.oneWay(`model.validations.attrs.${valuePath}`));
  //   defineProperty(this, 'value', computed.alias(`model.${valuePath}`));
  // },
  // showMessage: computed('didValidate', function() {
  //   return this.get('didValidate');
  // }),
  // isValid: computed.oneWay('attributeValidation.isValid'),
  // isInvalid: computed.oneWay('attributeValidation.isInvalid')
});
