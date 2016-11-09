import Ember from 'ember';
import { ValidationComponentInit, ValidationComponentPieces } from 'bsrs-ember/mixins/validation-component';

/**
 Component to reuse showMessage block
 */
export default Ember.Component.extend(ValidationComponentInit, ValidationComponentPieces, {
  type: 'text',
});
