import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import CopyMixin from 'bsrs-ember/mixins/model/copy';
import PhoneNumberMixin from 'bsrs-ember/mixins/model/person/phone_number';
import AddressMixin from 'bsrs-ember/mixins/model/person/address';
import RoleMixin from 'bsrs-ember/mixins/model/person/role';
import LocationMixin from 'bsrs-ember/mixins/model/person/location';
import config from 'bsrs-ember/config/environment';
import NewMixin from 'bsrs-ember/mixins/model/new';

var Person = Model.extend(CopyMixin, PhoneNumberMixin, AddressMixin, RoleMixin, LocationMixin, NewMixin, {
    uuid: injectUUID('uuid'),
    store: inject('main'),
    username: attr(''),
    password: attr(''),
    first_name: attr(''),
    middle_initial: attr(''),
    last_name: attr(''),
    title: attr(''),
    employee_id: attr(''),
    auth_amount: attr(''),
    locale: attr(''),
    role_fk: attr(),
    status_fk: '',
    phone_number_fks: [],
    address_fks: [],
    person_location_fks: [],
    isModelDirty: false,
    changingPassword: false,
    personCurrent: Ember.inject.service('person-current'),
    translationsFetcher: Ember.inject.service('translations-fetcher'),
    i18n: Ember.inject.service(),
    changeLocale(){
        var personCurrent = this.get('personCurrent');
        var personCurrentId = personCurrent.get('model.id');
        if(personCurrentId === this.get('id')){
            config.i18n.currentLocale = this.get('locale');
            return this.get('translationsFetcher').fetch().then(function(){
                this.get('i18n').set('locale', config.i18n.currentLocale);
            }.bind(this));
        }
    },
    rollbackStatus() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if(status && status.get('id') !== status_fk) {
            this.change_status(status_fk);
        }
    },
    saveStatus() {
        let status = this.get('status');
        if (status) { this.set('status_fk', status.get('id')); }
    },
    statusIsDirty: Ember.computed('status', 'status_fk', function() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if (status) {
            return status.get('id') === status_fk ? false : true;
        }
    }),
    change_status(status_id) {
        let store = this.get('store');
        const id = this.get('id');
        const old_status = this.get('status');
        const people_ids = old_status.get('people');
        let updated_old_status_people = people_ids.filter((id) => {
            return id !== id; 
        });
        old_status.set('people', updated_old_status_people);
        const new_status = store.find('status', status_id);
        const new_status_people = new_status.get('people') || [];
        new_status.set('people', new_status_people.concat(id));
    },
    status: Ember.computed.alias('belongs_to_status.firstObject'),
    belongs_to_status: Ember.computed(function() {
        const status_fk = this.get('status_fk');
        const filter = (status) => {
            return Ember.$.inArray(this.get('id'), status.get('people')) > -1;
        };
        return this.get('store').find('status', filter, ['people']);
    }),
    fullname: Ember.computed('first_name', 'last_name', function() {
        var first_name = this.get('first_name');
        var last_name = this.get('last_name');
        return first_name + ' ' + last_name;
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'phoneNumbersIsDirty', 'addressesIsDirty', 'roleIsDirty', 'locationsIsDirty', 'statusIsDirty', function() {
        return this.get('isDirty') || this.get('phoneNumbersIsDirty') || this.get('addressesIsDirty') || this.get('roleIsDirty') || this.get('locationsIsDirty') || this.get('statusIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    clearPassword() {
        this.set('password', '');
    },
    saveRelated() {
        this.savePhoneNumbers();
        this.saveAddresses();
        this.saveRole();
        this.saveLocations();
        this.clearPassword();
        this.saveStatus();
    },
    rollbackRelated() {
        this.changeLocale();
        this.rollbackPhoneNumbers();
        this.rollbackAddresses();
        this.rollbackRole();
        this.rollbackLocations();
        this.rollbackStatus();
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

        var payload = {
            id: this.get('id'),
            username: this.get('username'),
            first_name: this.get('first_name'),
            middle_initial: this.get('middle_initial'),
            last_name: this.get('last_name'),
            title: this.get('title'),
            employee_id: this.get('employee_id'),
            auth_amount: this.get('auth_amount'),
            status: this.get('status').get('id'),
            role: this.get('role').get('id'),
            emails: [],
            locations: this.get('location_ids'),
            phone_numbers: phone_numbers,
            addresses: addresses,
            locale: locale_fk,
            password: this.get('password'),
        };
        if (!this.get('password')) {
            delete payload.password;
        }
        return payload;

    },
    removeRecord() {
        this.get('store').remove('person', this.get('id'));
    }
});

export default Person;
