import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import CopyMixin from 'bsrs-ember/mixins/model/copy';
import EmailMixin from 'bsrs-ember/mixins/model/email';
import PhoneNumberMixin from 'bsrs-ember/mixins/model/phone_number';
import AddressMixin from 'bsrs-ember/mixins/model/address';
import RoleMixin from 'bsrs-ember/mixins/model/person/role';
import LocationMixin from 'bsrs-ember/mixins/model/person/location';
import StatusMixin from 'bsrs-ember/mixins/model/status';
import LocaleMixin from 'bsrs-ember/mixins/model/person/locale';
import config from 'bsrs-ember/config/environment';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { belongs_to_save } from 'bsrs-components/attr/belongs-to';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
    username: validator('unique-username')
});

var Person = Model.extend(Validations, CopyMixin, EmailMixin, PhoneNumberMixin, AddressMixin, RoleMixin, LocationMixin, StatusMixin, LocaleMixin, NewMixin, {
    type: 'person',
    store: inject('main'),
    username: attr(''),
    password: attr(''),
    first_name: attr(''),
    middle_initial: attr(''),
    last_name: attr(''),
    title: attr(''),
    employee_id: attr(''),
    auth_amount: attr(''),
    locale_fk: '',
    role_fk: undefined,
    status_fk: '',
    phone_number_fks: [],
    address_fks: [],
    email_fks: [],
    person_location_fks: [],
    isModelDirty: false,
    changingPassword: false,
    //models are leaf nodes and should be given a set of data and encapsulate and work on that data
    //tightly coupled.  Ideally, route would get services or hand off to another service to collect them all
    //and hands all information.  Person owns locale, so how do you rollback locale
    personCurrent: Ember.inject.service('person-current'),
    translationsFetcher: Ember.inject.service('translations-fetcher'),
    i18n: Ember.inject.service(),
    changeLocale(){
        const personCurrent = this.get('personCurrent');
        const personCurrentId = personCurrent.get('model.id');
        if(personCurrentId === this.get('id')){
            config.i18n.currentLocale = this.get('locale').get('locale');
            return this.get('translationsFetcher').fetch().then(function(){
                this.get('i18n').set('locale', config.i18n.currentLocale);
            }.bind(this));
        }
    },
    fullname: Ember.computed('first_name', 'last_name', function() {
        const first_name = this.get('first_name');
        const last_name = this.get('last_name');
        return first_name + ' ' + last_name;
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'emailsIsDirty', 'phoneNumbersIsDirty', 'addressesIsDirty', 'roleIsDirty', 'locationsIsDirty', 'statusIsDirty', 'localeIsDirty', function() {
        return this.get('isDirty') || this.get('phoneNumbersIsDirty') || this.get('addressesIsDirty') || this.get('roleIsDirty') || this.get('locationsIsDirty') || this.get('statusIsDirty') || this.get('emailsIsDirty') || this.get('localeIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    clearPassword() {
        this.set('password', '');
    },
    saveStatus: belongs_to_save('person', 'status', 'status_fk'),
    saveRelated() {
        this.saveEmails();
        this.savePhoneNumbers();
        this.saveAddresses();
        this.saveRole();
        this.saveLocations();
        this.clearPassword();
        this.saveStatus();
        this.saveLocale();
    },
    rollbackRelated() {
        this.changeLocale();
        this.rollbackEmails();
        this.rollbackPhoneNumbers();
        this.rollbackAddresses();
        this.rollbackRole();
        this.rollbackLocations();
        this.rollbackStatus();
        this.rollbackLocale();
    },
    createSerialize() {
        return {
            id: this.get('id'),
            username: this.get('username'),
            password: this.get('password'),
            role: this.get('role').get('id'),
            status: this.get('status_fk')
        };
    },
    serialize() {
        const store = this.get('store');
        const emails = this.get('emails').filter(function(email) {
            if(email.get('invalid_email')) {
                return;
            }
            return email;
        }).map((email) => {
            return email.serialize();
        });
        const phone_numbers = this.get('phone_numbers').filter(function(num) {
            if(num.get('invalid_number')) {
                return;
            }
            return num;
        }).map(function(num) {
            return num.serialize();
        });
        const addresses = this.get('addresses').filter(function(address) {
            if (address.get('invalid_address')) {
                return;
            }
            return address;
        }).map(function(address) {
            return address.serialize();
        });

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
            locations: this.get('location_ids'),
            emails: emails,
            phone_numbers: phone_numbers,
            addresses: addresses,
            locale: this.get('locale.id'),
            password: this.get('password'),
        };
        if (!this.get('password')) {
            delete payload.password;
        }
        return payload;

    },
    removeRecord() {
        run(() => {
            this.get('store').remove('person', this.get('id'));
        });
    }
});

export default Person;
