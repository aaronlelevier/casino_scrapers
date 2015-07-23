import Ember from 'ember';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PhoneNumberDefaults from 'bsrs-ember/vendor/phone-number-type';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['input-multi t-input-multi-phone'],
    fieldNames: 'number',
    actions: {
        changed(phonenumber, val) {
            var phonenumber_type = parseInt(val, 10);
            Ember.run(() => {
                phonenumber.set('type', phonenumber_type);
            });
        },
        append() {
            this.get('model').pushObject(PhoneNumber.create({type: PhoneNumberDefaults.officeType}));
        },
        delete(entry) {
            this.get('model').removeObject(entry);
        }
    }
}); 
