import Ember from 'ember';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PhoneNumberDefaults from 'bsrs-ember/value-defaults/phone-number-type';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['input-multi t-input-multi-phone'],
    fieldNames: 'number',
    actions: {
        changed: function(phonenumber, val) {
            var phonenumber_type = parseInt(val, 10);
            Ember.run(function() {
                phonenumber.set('type', phonenumber_type);
            });
        },
        append: function() {
            this.get('model').pushObject(PhoneNumber.create({type: PhoneNumberDefaults.officeType}));
        },
        delete: function(entry) {
            this.get('model').removeObject(entry);
        }
    }
}); 
