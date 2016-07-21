import Ember from 'ember';
const { run } = Ember;
const { computed, defineProperty, observer } = Ember;
import { task, timeout } from 'ember-concurrency';

/*
* didValidate - trigger showMessage and can show mwwage if
*/
export default Ember.Component.extend({
  type: 'text',
  focusedOut: false,
  attributevalidation: null,
  classNameBindings: ['showMessage:invalid'],
  init() {
    this._super(...arguments);
    const valuePath = this.get('valuePath');
    defineProperty(this, 'attributeValidation', computed.oneWay(`model.validations.attrs.${valuePath}`));
    defineProperty(this, 'value', computed.alias(`model.${valuePath}`));
  },
  showMessage: computed('didValidate', 'focusedOut', function() {
    return this.get('didValidate') || this.get('focusedOut');
  }),
  isValid: computed.oneWay('attributeValidation.isValid'),
  isInvalid: computed.oneWay('attributeValidation.isInvalid'),
  setFocusedOut: task(function * () {
    yield timeout(1500);
    /* jshint ignore:start */
    if (this.get('isInvalid')) { this.set('focusedOut', true); }
    /* jshint ignore:end */
  }).restartable(),
  actions: {
    focusedOut() {
      if (this.get('isInvalid')) { this.set('focusedOut', true); }
    },
    keyedUp() {
      if (this.get('isInvalid')) {
        this.get('setFocusedOut').perform();
      } else {
        this.set('focusedOut', false);
      }
    }
  }
});
