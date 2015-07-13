import Ember from 'ember';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PhoneNumberDefaults from 'bsrs-ember/value-defaults/phonenumber-type';

export default Ember.Component.extend({
    tagName: 'div',
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
        },
        delete: function(entry) {
            this.get('model').removeObject(entry);
        }
    }
}); 
