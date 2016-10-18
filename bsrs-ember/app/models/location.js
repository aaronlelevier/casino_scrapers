import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import equal from 'bsrs-ember/utilities/equal';
// import EmailMixin from 'bsrs-ember/mixins/model/email';
// import PhoneNumberMixin from 'bsrs-ember/mixins/model/phone_number';
// import AddressMixin from 'bsrs-ember/mixins/model/address';
import CopyMixin from 'bsrs-ember/mixins/model/copy';
import ChildrenMixin from 'bsrs-ember/mixins/model/location/children';
import ParentMixin from 'bsrs-ember/mixins/model/location/parent';
import LocationLevelMixin from 'bsrs-ember/mixins/model/location/location-level';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many, many_to_many_dirty_unlessAddedM2M } from 'bsrs-components/attr/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/location';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  name: validator('presence', {
    presence: true,
    message: 'errors.location.name'
  }),
  number: validator('presence', {
    presence: true,
    message: 'errors.location.number'
  }),
  location_level: validator('presence', {
    presence: true,
    message: 'errors.location.location_level'
  }),
  status: validator('presence', {
    presence: true,
    message: 'errors.location.status'
  }),
  phonenumbers: validator('has-many'),
  emails: validator('has-many'),
  addresses: validator('has-many'),
});

var LocationModel = Model.extend(CopyMixin, ParentMixin, ChildrenMixin, LocationLevelMixin, Validations, OptConf, {
  init() {
    belongs_to.bind(this)('status', 'location', {bootstrapped:true});
    belongs_to.bind(this)('location_level', 'location', {bootstrapped:true, change_func:false});
    many_to_many.bind(this)('children', 'location', {add_func:false});
    many_to_many.bind(this)('parent', 'location', {plural:true, add_func:false});
    many_to_many.bind(this)('phonenumber', 'location', {plural:true, dirty:false});
    many_to_many.bind(this)('address', 'location', {plural:true, dirty:false});
    many_to_many.bind(this)('email', 'location', {plural:true, dirty:false});
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  name: attr(''),
  number: attr(''),
  status_fk: undefined,
  location_level_fk: undefined,
  tickets: [],
  location_phonenumbers_fks: [],
  location_emails_fks: [],
  location_addresses_fks: [],
  // PH
  phonenumbersIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('location_phonenumbers'),
  phonenumbersIsDirty: Ember.computed('phonenumbers.@each.{isDirtyOrRelatedDirty}', 'phonenumbersIsDirtyContainer', function() {
    const phonenumbers = this.get('phonenumbers');
    return phonenumbers.isAny('isDirtyOrRelatedDirty') || this.get('phonenumbersIsDirtyContainer');
  }).readOnly(),
  phonenumbersIsNotDirty: Ember.computed.not('phonenumbersIsDirty'),
  rollbackPhonenumbersContainer() {
    const phonenumbers = this.get('phonenumbers');
    phonenumbers.forEach((model) => {
      model.rollback();
    });
  },
  savePhonenumbersContainer() {
    const phonenumbers = this.get('phonenumbers');
    phonenumbers.forEach((phonenumber) => {
      // remove non valid phone numbers
      if (phonenumber.get('invalid_number')) {
        this.removePhonenumber(phonenumber);
      } else {
        phonenumber.saveRelated();
        phonenumber.save();
      }
    });
  },
  removePhonenumber(phonenumber) {
    const remove_joins = [];
    this.get('location_phonenumbers').forEach((join_model) => {
      if (join_model.get('phonenumber_pk') === phonenumber.get('id')) {
        remove_joins.push(join_model.get('id'));
      } 
    });
    run(() => {
      remove_joins.forEach((join_model_pk) => {
        this.get('simpleStore').push('location-join-phonenumber', {id: join_model_pk, removed: true}) ;
        this.set('location_phonenumbers_fks', this.get('location_phonenumbers_fks').filter(fk => fk === join_model_pk));
      });
    });
  },
  // EMAIL
  emailsIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('location_emails'),
  emailsIsDirty: Ember.computed('emails.@each.{isDirtyOrRelatedDirty}', 'emailsIsDirtyContainer', function() {
    const emails = this.get('emails');
    return emails.isAny('isDirtyOrRelatedDirty') || this.get('emailsIsDirtyContainer');
  }).readOnly(),
  emailsIsNotDirty: Ember.computed.not('emailsIsDirty').readOnly(),
  rollbackEmailsContainer() {
    const emails = this.get('emails');
    emails.forEach((model) => {
      model.rollback();
    });
  },
  saveEmailsContainer() {
    const emails = this.get('emails');
    emails.forEach((email) => {
      // remove non valid phone numbers
      if (email.get('invalid_email')) {
        this.removeEmail(email);
      } else {
        email.saveRelated();
        email.save();
      }
    });
  },
  removeEmail(email) {
    const remove_joins = [];
    this.get('location_emails').forEach((join_model) => {
      if (join_model.get('email_pk') === email.get('id')) {
        remove_joins.push(join_model.get('id'));
      } 
    });
    run(() => {
      remove_joins.forEach((join_model_pk) => {
        this.get('simpleStore').push('location-join-email', {id: join_model_pk, removed: true}) ;
        this.set('location_emails_fks', this.get('location_emails_fks').filter(fk => fk === join_model_pk));
      });
    });
  },
  // address
  addressesIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('location_addresses'),
  addressesIsDirty: Ember.computed('addresses.@each.{isDirtyOrRelatedDirty}', 'addressesIsDirtyContainer', function() {
    const addresses = this.get('addresses');
    return addresses.isAny('isDirtyOrRelatedDirty') || this.get('addressesIsDirtyContainer');
  }).readOnly(),
  addressesIsNotDirty: Ember.computed.not('addressesIsDirty').readOnly(),
  rollbackAddressesContainer() {
    const addresses = this.get('addresses');
    addresses.forEach((model) => {
      model.rollback();
    });
  },
  saveAddressesContainer() {
    const addresses = this.get('addresses');
    addresses.forEach((address) => {
      // remove non valid addresses
      if (address.get('invalid_address')) {
        this.removeAddress(address);
      } else {
        address.saveRelated();
        address.save();
      }
    });
  },
  removeAddress(address) {
    const remove_joins = [];
    this.get('location_addresses').forEach((join_model) => {
      if (join_model.get('address_pk') === address.get('id')) {
        remove_joins.push(join_model.get('id'));
      } 
    });
    run(() => {
      remove_joins.forEach((join_model_pk) => {
        this.get('simpleStore').push('location-join-address', {id: join_model_pk, removed: true}) ;
        this.set('location_addresses_fks', this.get('location_addresses_fks').filter(fk => fk === join_model_pk));
      });
    });
  },
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'statusIsDirty', 'phonenumbersIsDirty', 'addressesIsDirty', 'emailsIsDirty', 'childrenIsDirty', 'parentsIsDirty', function() {
    return this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('statusIsDirty') || this.get('phonenumbersIsDirty') || this.get('addressesIsDirty') || this.get('emailsIsDirty') || this.get('childrenIsDirty') || this.get('parentsIsDirty');
  }).readOnly(),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty').readOnly(),
  saveRelated() {
    this.saveLocationLevel();
    this.saveStatus();
    this.saveEmailsContainer();
    this.saveEmails();
    this.savePhonenumbersContainer();
    this.savePhonenumbers();
    this.saveAddressesContainer();
    this.saveAddresses();
    this.saveChildren();
    this.saveParents();
  },
  rollback() {
    this.rollbackLocationLevel();
    this.rollbackStatus();
    this.rollbackEmailsContainer();
    this.rollbackEmails();
    this.rollbackPhonenumbersContainer();
    this.rollbackPhonenumbers();
    this.rollbackAddressesContainer();
    this.rollbackAddresses();
    this.rollbackChildren();
    this.rollbackParents();
    this._super(...arguments);
  },
  serialize() {
    var emails = this.get('emails').filter(function(email) {
      if(email.get('invalid_email')) {
        return;
      }
      return email;
    }).map((email) => {
      return email.serialize();
    });
    var phone_numbers = this.get('phonenumbers').filter(function(num) {
      if(num.get('invalid_number')) {
        return;
      }
      return num;
    }).map((num) => {
      return num.serialize();
    });
    var addresses = this.get('addresses').filter(function(address) {
      if (address.get('invalid_address')) {
        return;
      }
      return address;
    }).map((address) => {
      return address.serialize();
    });
    return {
      id: this.get('id'),
      name: this.get('name'),
      number: this.get('number'),
      status: this.get('status.id'),
      location_level: this.get('location_level.id'),
      children: this.get('children_ids'),
      parents: this.get('parents_ids'),
      emails: emails,
      phone_numbers: phone_numbers,
      addresses: addresses,
    };
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('location', this.get('id'));
    });
  },
});

export default LocationModel;
