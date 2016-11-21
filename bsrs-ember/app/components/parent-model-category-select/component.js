import Ember from 'ember';
// import { ValidationComponentInit, ValidationComponentPieces } from 'bsrs-ember/mixins/validation-component';
const { computed, defineProperty } = Ember;

var ParentTicketCategorySelect = Ember.Component.extend({
  init() {
    this._super(...arguments);
    const valuePath = this.get('valuePath');
    defineProperty(this, 'attributeValidation', computed.oneWay(`model.validations.attrs.${valuePath}`));
    defineProperty(this, 'value', computed.alias(`model.${valuePath}`));
  },
  attributeValidation: null,
  showMessage: computed('localDidValidate', 'focusedOut', function() {
    return this.get('localDidValidate');
  }),
  // TODO: this is incomplete.  Need full story on how to show validtion msgs
  localDidValidate: computed(function() {
    return this.get('isInvalid');
  }),
  isValid: computed.oneWay('attributeValidation.isValid'),
  isInvalid: computed.oneWay('attributeValidation.isInvalid'),
});

export default ParentTicketCategorySelect;
