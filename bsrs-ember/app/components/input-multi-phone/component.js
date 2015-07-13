import Ember from 'ember';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import InputMultiComponent from 'bsrs-ember/components/input-multi/component';
import PhoneNumberDefaults from 'bsrs-ember/value-defaults/phonenumber-type';

export default InputMultiComponent.extend({
  classNames: ['input-multi t-input-multi-phone'],
  fieldNames: 'number',

  actions: {
    changed: function(phonenumber, val) {
        Ember.run(function() {
            phonenumber.set('type', val);
        });
    },
    append: function() {
      this.get('model').pushObject(PhoneNumber.create({type: PhoneNumberDefaults.officeType}));
    }
  }
});
