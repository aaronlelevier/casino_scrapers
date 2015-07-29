import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

export default Model.extend({
    store: inject('main'),
    username: attr(''),
    phone_numbers: Ember.computed('id', function() {
        var store = this.get('store');
        return store.find('phonenumber', {person_id: this.get('id')});
    }),
    addresses: Ember.computed('id', function() {
        var store = this.get('store');
        return store.find('address', {person_id: this.get('id')});
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'phoneNumbersIsDirty', function() {
        return this.get('isDirty') || this.get('phoneNumbersIsDirty'); 
    }),
    phoneNumbersIsDirty: Ember.computed('phone_numbers.@each.isDirty', 'phone_numbers.@each.number', 'phone_numbers.@each.type', function() {
        var phone_numbers = this.get('phone_numbers');
        var phone_number_dirty = false;
        phone_numbers.forEach((num) => {
            if (num.get('isDirty')) {
                phone_number_dirty = true;
            }
        });
        return phone_number_dirty;
    }),
    phoneNumbersIsNotDirty: Ember.computed.not('phoneNumbersIsDirty'),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    savePhoneNumbers: function() {
        var phone_numbers = this.get('phone_numbers');
        phone_numbers.forEach((num) => {
            num.save();
        });
    },
    rollbackPhoneNumbers: function() {
        var phone_numbers = this.get('phone_numbers');
        phone_numbers.forEach((num) => {
            num.rollback();
        });
    },
    serialize: function () {
        var phone_numbers = this.get('phone_numbers').map(function(number) {
            return number.serialize();
        });
        var addresses = this.get('addresses').map(function(address) {
            return address.serialize();
        });
        return JSON.stringify({
            'id': this.get('id'),
            'username': this.get('username'),
            'password': this.get('password'),
            'first_name': this.get('first_name'),
            'middle_initial': this.get('middle_initial'),
            'last_name': this.get('last_name'),
            'title': this.get('title'),
            'emp_number': this.get('emp_number'),
            'location':'',
            'auth_amount': this.get('auth_amount'),
            'status': 1,
            'role': 1,
            'email': this.get('email'),
            'phone_numbers': phone_numbers,
            'addresses': addresses
        });
    }
});
