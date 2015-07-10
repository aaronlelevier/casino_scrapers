import Ember from 'ember';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import InputMultiComponent from 'bsrs-ember/components/input-multi/component';

export default InputMultiComponent.extend({
  classNames: ['input-multi t-input-multi-phone'],
  fieldNames: 'number',
  actions: {
    changed: function(phonenumber, val) {
        Ember.run(function() {
            phonenumber.set('type', val);
        });
        //this.get('target').send('changed', val); ?? when is this used?
    },
    append: function() {
      this.get('model').pushObject(PhoneNumber.create({type: 1}));
    }
  }
}); 
