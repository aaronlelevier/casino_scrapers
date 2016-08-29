import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import KeyCodes  from 'bsrs-ember/utilities/key-codes';
import InputDynamic from 'bsrs-ember/components/input-dynamic/component';

/* @class InputDynamicFilter
 * @param {obj} obj=filterModel 
 * @param {string} placeholder 
 * @param {...} prop=filterField
 * getter/setter on InputDynamic Component
*/
var InputDynamicFilter = InputDynamic.extend({
  eventbus: Ember.inject.service(),
  observeValid: Ember.observer('value', function() {
    Ember.run.debounce(this, this.valueUpdated, config.DEBOUNCE_TIMEOUT_INTERVAL, false);
  }),
  valueUpdated: function() {
    let prop = this.get('prop');
    let value = this.get('value');
    if(value !== null) {
      this.get('eventbus').publish('bsrs-ember@component:input-dynamic-filter:', this, 'onValueUpdated', prop, value);
    }
  },
  keyDown: function (event) {
    if (KeyCodes.keyPressed(event) === 'enter' || KeyCodes.keyPressed(event) === 'escape' ) {
      this.sendAction('close');
    }
  }
});

export default InputDynamicFilter;
