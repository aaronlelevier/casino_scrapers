import Ember from 'ember';
import KeyCodes  from 'bsrs-ember/utilities/key-codes';
import InputDynamic from 'bsrs-ember/components/input-dynamic/component';

export default InputDynamic.extend({
    eventbus: Ember.inject.service(),
    observeValid: Ember.observer('value', function() {
        Ember.run.once(this, 'valueUpdated');
    }),
    valueUpdated: function() {
        let prop = this.get('prop');
        let value = this.get('value');
        this.get('eventbus').publish('bsrs-ember@component:input-dynamic-filter:', this, 'onValueUpdated', prop, value);
    },
    keyDown: function (event) {
        if (KeyCodes.keyPressed(event) === 'enter' || KeyCodes.keyPressed(event) === 'escape' ) {
            this.sendAction('close');
        }
    }
});
