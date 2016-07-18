import Ember from 'ember';
const { computed, defineProperty, observer } = Ember;

/*
* didValidate - trigger showMessage and can show mwwage if 
*/
export default Ember.Component.extend({
  type: 'text',
  wasSet: false,
  attributeValidation: null,
  classNameBindings: ['showErrorClass:has-error'],
  init() {
    this._super(...arguments);
    const valuePath = this.get('valuePath');
    defineProperty(this, 'attributeValidation', computed.oneWay(`model.validations.attrs.${valuePath}`));
    defineProperty(this, 'value', computed.alias(`model.${valuePath}`));
  },
  inputValueChange: observer('value', function() {
    this.set('wasSet', true);
  }),
  showMessage: computed('attributeValidation.isDirty', 'isInvalid', 'didValidate', function() {
    return (this.get('model.isDirty') || this.get('didValidate') || this.get('wasSet')) && this.get('isInvalid');
  }),
  isValid: computed.oneWay('attributeValidation.isValid'),
  isInvalid: computed.oneWay('attributeValidation.isInvalid'),
  showErrorClass: computed('showMessage', 'attributeValidation', function() {
    return this.get('attributeValidation') && this.get('showMessage');
  }),
});
