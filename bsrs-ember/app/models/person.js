import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import loopAttrs from 'bsrs-ember/utilities/loop-attrs';

export default Model.extend({
    store: inject('main'),
    username: attr(''),
    first_name: attr(''),
    middle_initial: attr(''),
    last_name: attr(''),
    title: attr(''),
    employee_id: attr(''),
    auth_amount: attr(''),
    isModelDirty: false,
    dirtyModel: Ember.computed('isModelDirty', {
        get(key) {
            return this.isModelDirty;
        },
        set(key, value) {
            this.set('isModelDirty', value);
            return this.get('isModelDirty');
        }
    }),
    full_name: Ember.computed('first_name', 'last_name', function() {
        var first_name = this.get('first_name');
        var last_name = this.get('last_name');
        return first_name + ' ' + last_name;
    }),
    role_person: Ember.computed('id', function() {
        var store = this.get('store');
        return store.find('role-person', {person: this.get('id')}).objectAt(0);
    }),
    phone_numbers: Ember.computed('id', function() {
        var store = this.get('store');
        return store.find('phonenumber', {person: this.get('id')});
    }),
    addresses: Ember.computed('id', function() {
        var store = this.get('store');
        return store.find('address', {person: this.get('id')});
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'phoneNumbersIsDirty', 'roleIsDirty', 'addressesIsDirty', 'dirtyModel', function() {
        return this.get('isDirty') || this.get('phoneNumbersIsDirty') || this.get('addressesIsDirty') || this.get('roleIsDirty') || this.get('dirtyModel');
    }),
    roleIsDirty: Ember.computed('role_person.isDirty', function() {
        let role_dirty = false;
        let role = this.get('role_person');
        if (role && role.get('isDirty')) { role_dirty = true; }
        return role_dirty;
    }),
    roleIsNotDirty: Ember.computed.not('roleIsDirty'),
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
    addressesIsDirty: Ember.computed('addresses.@each.isDirty', 'addresses.@each.address', 'addresses.@each.city', 'addresses.@each.state', 
                                     'addresses.@each.postal_code', 'addresses.@each.country', 'addresses.@each.type', function() {
        var addresses = this.get('addresses');
        var address_dirty = false;
        addresses.forEach((address) => {
            if (address.get('isDirty')) {
                address_dirty = true;
            }
        });
        return address_dirty;
    }),
    addressesIsNotDirty: Ember.computed.not('addressesIsDirty'),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    savePhoneNumbers: function() {
        var phone_numbers = this.get('phone_numbers');
        phone_numbers.forEach((num) => {
            num.save();
        });
    },
    saveAddresses: function() {
        var addresses = this.get('addresses');
        addresses.forEach((address) => {
            address.save();
        });
    },
    rollbackRelated() {
        this.rollbackPhoneNumbers();
        this.rollbackAddresses();
    },
    rollbackPhoneNumbers() {
        var phone_numbers = this.get('phone_numbers');
        phone_numbers.forEach((num) => {
            num.rollback();
        });
    },
    rollbackAddresses() {
        var addresses = this.get('addresses');
        addresses.forEach((address) => {
            address.rollback();
        });
    },
    createSerialize() {
        var store = this.get('store');
        var role_id = store.findOne('role').get('id');
        return {
            id: this.get('id'),
            username: this.get('username'),
            password: this.get('password'),
            role: role_id
        };
    },
    serialize() {
        //TODO: remove this hard reference to get the first role/status in favor of
        //a truly dynamic lookup via the new/update forms
        var store = this.get('store');
        var role_id = store.findOne('role').get('id');
        var status_id = store.findOne('status').get('id');
        var phone_numbers = this.get('phone_numbers').map(function(number) {
            return number.serialize();
        });
        var addresses = this.get('addresses').map(function(address) {
            return address.serialize();
        });
        return {
            id: this.get('id'),
            username: this.get('username'),
            password: this.get('password'),
            first_name: this.get('first_name'),
            middle_initial: this.get('middle_initial'),
            last_name: this.get('last_name'),
            title: this.get('title'),
            employee_id: this.get('employee_id'),
            location:'',
            auth_amount: this.get('auth_amount'),
            status: status_id,
            role: this.get('role_person').get('id'),
            emails: [],
            phone_numbers: phone_numbers,
            addresses: addresses
        };
    },
    removeRecord(id) {
        this.get('store').remove('person', id);
    },
    isNew: Ember.computed(function() {
        return loopAttrs(this);
    })
});
