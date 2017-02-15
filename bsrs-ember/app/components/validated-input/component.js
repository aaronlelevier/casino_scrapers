import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
const { computed, defineProperty } = Ember;
import { task, timeout } from 'ember-concurrency';
import { ValidationComponentInit, ValidationComponentPieces } from 'bsrs-ember/mixins/validation-component';

const TIMEOUT = config.APP.VALIDATION_TIMEOUT_INTERVAL;

/* @class ValidatedInput
* API
* - 'model'
* - 'count' if multiple so can have many ids
* - 'maxlength' for html5 validation
* - 'valuePath'
* - 'placeholder'
* - 'className'
*/
export default Ember.Component.extend(ValidationComponentPieces, ValidationComponentInit, {
  type: 'text',
  tageName: '',
  readonly: false,
  setFocusedOut: task(function * () {
    yield timeout(TIMEOUT);
    if (this.get('isInvalid')) {
      if (this.get('focused')) {
        this.set('showMessage', true);
      }
      this.set('invalidClass', true); 
    }
  }).restartable(),
  actions: {
    focusedOut() {
      if (this.get('readonly')) {
        return false; // input|textarea[readonly] still allows events, not editing
      }
      if (this.get('isInvalid')) { 
        this.set('showMessage', false);
        this.set('invalidClass', true); 
        this.set('focused', false); 
      }
    },
    keyedUp() {
      if (this.get('readonly')) {
        return false; // input|textarea[readonly] still allows events, not editing
      }
      if (this.get('isInvalid')) {
        this.set('focused', true); 
        this.get('setFocusedOut').perform();
      } else {
        this.set('showMessage', false);
        this.set('invalidClass', false); 
        this.set('focused', true); 
      }
    }
  }
});
