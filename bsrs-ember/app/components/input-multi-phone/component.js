import Ember from 'ember';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PhoneNumberDefaults from 'bsrs-ember/value-defaults/phone-number-type';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['input-multi t-input-multi-phone'],
    fieldNames: 'number',
    actions: {
        changed: function(phonenumber) {
            var val = arguments[1].target.selectedIndex + 1; //+1 to increase index to match ids for options
            Ember.run(function() {
                var phonenumber_type = val;
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
