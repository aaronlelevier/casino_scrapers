import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import NewMixin from 'bsrs-ember/mixins/model/new';
import CopyMixin from 'bsrs-ember/mixins/model/copy';
import PhoneNumberMixin from 'bsrs-ember/mixins/model/person/phone_number';
import AddressMixin from 'bsrs-ember/mixins/model/person/address';
import RoleMixin from 'bsrs-ember/mixins/model/person/role';
import LocationMixin from 'bsrs-ember/mixins/model/person/location';

var Person = Model.extend(NewMixin, CopyMixin, PhoneNumberMixin, AddressMixin, RoleMixin, LocationMixin, {
    uuid: injectUUID('uuid'),
    store: inject('main'),
    username: attr(''),
    first_name: attr(''),
    middle_initial: attr(''),
    last_name: attr(''),
    title: attr(''),
    employee_id: attr(''),
    auth_amount: attr(''),
    locale: attr(''),
    role_fk: undefined,
    phone_number_fks: [],
    address_fks: [],
    person_location_fks: [],
    isModelDirty: false,
    fullname: Ember.computed('first_name', 'last_name', function() {
        var first_name = this.get('first_name');
        var last_name = this.get('last_name');
        return first_name + ' ' + last_name;
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'phoneNumbersIsDirty', 'addressesIsDirty', 'roleIsDirty', 'locationsIsDirty', function() {
        return this.get('isDirty') || this.get('phoneNumbersIsDirty') || this.get('addressesIsDirty') || this.get('roleIsDirty') || this.get('locationsIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    saveRelated() {
        this.savePhoneNumbers();
        this.saveAddresses();
        this.saveRole();
        this.saveLocations();
    },
    rollbackRelated() {
        this.rollbackPhoneNumbers();
        this.rollbackAddresses();
        this.rollbackRole();
        this.rollbackLocations();
    },
    createSerialize() {
        return {
            id: this.get('id'),
            username: this.get('username'),
            password: this.get('password'),
            role: this.get('role').get('id')
        };
    },
    serialize() {
        var store = this.get('store');
        var status_id = store.findOne('status').get('id');
        var phone_numbers = this.get('phone_numbers').filter(function(num) {
            if(num.get('invalid_number')) {
                return;
            }
            return num;
        }).map(function(num) {
            return num.serialize();
        });
        var addresses = this.get('addresses').filter(function(address) {
            if (address.get('invalid_address')) {
                return;
            }
            return address;
        }).map(function(address) {
            return address.serialize();
        });
        var locale = store.find('locale', {locale: this.get('locale')});
        var locale_fk = locale.objectAt(0) ? locale.objectAt(0).get('id') : '';
        return {
            id: this.get('id'),
            username: this.get('username'),
            password: this.get('password'),
            first_name: this.get('first_name'),
            middle_initial: this.get('middle_initial'),
            last_name: this.get('last_name'),
            title: this.get('title'),
            employee_id: this.get('employee_id'),
            auth_amount: this.get('auth_amount'),
            status: status_id,
            role: this.get('role').get('id'),
            emails: [],
            locations: this.get('location_ids'),
            phone_numbers: phone_numbers,
            addresses: addresses,
            locale: locale_fk
        };
    },
    removeRecord() {
        this.get('store').remove('person', this.get('id'));
    }
});

export default Person;
