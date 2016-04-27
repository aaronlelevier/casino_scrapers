import Ember from 'ember';
const { computed, observer, defineProperty, run } = Ember;

export default Ember.Component.extend({
  type: 'text',
  // rawInputValue: null,
  attributeValidation: null,
  classNameBindings: ['showErrorClass:has-error'],
  init() {
    this._super(...arguments);
    const valuePath = this.get('valuePath');
    defineProperty(this, 'attributeValidation', computed.oneWay(`model.validations.attrs.${valuePath}`));
    // this.set('rawInputValue', this.get(`model.${valuePath}`));
    // defineProperty(this, 'value', computed.alias(`model.${valuePath}`));
  },
  // inputValueChange: observer('rawInputValue', function() {
  //   run.debounce(this, this.setValue, 300, false);
  // }),
  // setValue() {
  //   this.set('value', this.get('rawInputValue'));
  // },
  showMessage: computed('attributeValidation.isDirty', 'isInvalid', 'didValidate', function() {
    return (this.get('attributeValidation.isDirty') || this.get('didValidate')) && this.get('isInvalid');
  }),
  isValid: computed.oneWay('attributeValidation.isValid'),
  isInvalid: computed.oneWay('attributeValidation.isInvalid'),
  showErrorClass: computed('showMessage', 'attributeValidation', function() {
    return this.get('attributeValidation') && this.get('showMessage');
  }),
});
