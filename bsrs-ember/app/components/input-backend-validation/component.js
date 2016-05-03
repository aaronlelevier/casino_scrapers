import Ember from 'ember';
const { computed, defineProperty } = Ember;

export default Ember.Component.extend({
  type: 'text',
  attributeValidation: null,
  classNameBindings: ['showErrorClass:has-error'],
  init() {
    this._super(...arguments);
    const valuePath = this.get('valuePath');
    defineProperty(this, 'attributeValidation', computed.oneWay(`model.validations.attrs.${valuePath}`));
  },
  showMessage: computed('attributeValidation.isDirty', 'isInvalid', 'didValidate', function() {
    return (this.get('attributeValidation.isDirty') || this.get('didValidate')) && this.get('isInvalid');
  }),
  isValid: computed.oneWay('attributeValidation.isValid'),
  isInvalid: computed.oneWay('attributeValidation.isInvalid'),
  showErrorClass: computed('showMessage', 'attributeValidation', function() {
    return this.get('attributeValidation') && this.get('showMessage');
  }),
});
