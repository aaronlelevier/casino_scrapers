import Ember from 'ember';
const { computed, defineProperty } = Ember;
import { task, timeout } from 'ember-concurrency';
import { ValidationComponentInit, ValidationComponentPieces } from 'bsrs-ember/mixins/validation-component';

/* @class ValidatedInputMulti - for inputs in a loop where valuePath is not a string but actual field value
 * eg. phonenumber
 * didValidate - trigger showMessage and can show msg if clicked save
 * -- API --
 * idz - ember-tether attachment.  Need count to ensure no duplicate ids
 * class - component test class or css class
 * className - class on input field
 * valuePath - m2m model on main model :: "phonenumbers" on location model
 * nestedValuePath - property on m2m model :: "number" on phonenumber model
 * count - array position for nested model (location - ph#s)
 * placeholder - input placeholder
*/
var ValidatedInputMulti = Ember.Component.extend(ValidationComponentInit, ValidationComponentPieces, {
  type: 'text',
  focusedOut: false,
  // attributeValidation: null,
  // classNameBindings: ['showMessage:invalid'],
  // init() {
  //   this._super(...arguments);
  //   const valuePath = this.get('valuePath');
  //   const nestedValuePath = this.get('nestedValuePath');
  //   const count = this.get('count');
  //   const nestedValidations = this.get('model').get(valuePath) || []; // can't inline b/c it will try .get and we need .objectAt(count)
  //   const nestedValidationObject = nestedValidations.objectAt(count);
  //   defineProperty(this, 'attributeValidation', computed.readOnly(`${nestedValidationObject}.validations.attrs.${nestedValuePath}`));
  //   defineProperty(this, 'value', computed.alias(`${nestedValidationObject}.${nestedValuePath}`));
  // },
  idz: Ember.computed(function() {
    return this.get('valuePath') + this.get('model.id');
  }),
  // showMessage: computed('localDidValidate', 'focusedOut', function() {
  //   return this.get('localDidValidate') || this.get('focusedOut');
  // }),
  // localDidValidate: computed('didValidate', function() {
  //   // Create local didValidate boolean so that can show err msg right away on save and
  //   // set back when fill in input
  //   return this.get('didValidate') && this.get('isInvalid');
  // }),
  // isValid: computed.oneWay('attributeValidation.isValid'),
  // isInvalid: computed.oneWay('attributeValidation.isInvalid'),
  setFocusedOut: task(function * () {
    yield timeout(1500);
    if (this.get('isInvalid')) {
      this.set('focusedOut', true);
    }
  }).restartable(),
  actions: {
    focusedOut() {
      if (this.get('isInvalid')) {
        this.set('focusedOut', true);
      }
    },
    keyedUp() {
      if (this.get('isInvalid')) {
        this.get('setFocusedOut').perform();
      } else {
        this.set('localDidValidate', false);
        this.set('focusedOut', false);
      }
    }
  }
});

export default ValidatedInputMulti;
