import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import CopyMixin from 'bsrs-ember/mixins/model/copy';
import PhoneNumberMixin from 'bsrs-ember/mixins/model/phone_number';
import AddressMixin from 'bsrs-ember/mixins/model/address';
import RoleMixin from 'bsrs-ember/mixins/model/person/role';
import LocationMixin from 'bsrs-ember/mixins/model/person/location';
import StatusMixin from 'bsrs-ember/mixins/model/status';
import config from 'bsrs-ember/config/environment';
import NewMixin from 'bsrs-ember/mixins/model/new';

var Person = Model.extend(CopyMixin, PhoneNumberMixin, AddressMixin, RoleMixin, LocationMixin, StatusMixin, NewMixin, {
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
    role_fk: undefined,
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
    createSerialize(id) {
        if(id) { this.set('id', id); }
        return {
            id: id || this.get('id'),
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
