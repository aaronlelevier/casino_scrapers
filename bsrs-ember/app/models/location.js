import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import NewMixin from 'bsrs-ember/mixins/model/new';
import inject from 'bsrs-ember/utilities/store';
import equal from 'bsrs-ember/utilities/equal';
import EmailMixin from 'bsrs-ember/mixins/model/email';
import PhoneNumberMixin from 'bsrs-ember/mixins/model/phone_number';
import AddressMixin from 'bsrs-ember/mixins/model/address';
import CopyMixin from 'bsrs-ember/mixins/model/copy';
import ChildrenMixin from 'bsrs-ember/mixins/model/location/children';
import ParentMixin from 'bsrs-ember/mixins/model/location/parent';
import LocationLevelMixin from 'bsrs-ember/mixins/model/location/location-level';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/location';


var LocationModel = Model.extend(CopyMixin, NewMixin, ParentMixin, ChildrenMixin, LocationLevelMixin, AddressMixin, PhoneNumberMixin, EmailMixin, OptConf, {
  init() {
    belongs_to.bind(this)('status', 'location');
    belongs_to.bind(this)('location_level', 'location', {'change_func': true});
    this._super(...arguments);
  },
  store: inject('main'),
  name: attr(''),
  number: attr(''),
  status_fk: undefined,
  location_level_fk: undefined,
  tickets: [],
  email_fks: [],
  phone_number_fks: [],
  address_fks: [],
  childrenIsDirty: many_to_many_dirty('location_children_ids', 'location_children_fks'),
  childrenIsNotDirty: Ember.computed.not('childrenIsDirty'),
  parentsIsDirty: many_to_many_dirty('location_parents_ids', 'location_parents_fks'),
  parentsIsNotDirty: Ember.computed.not('parentsIsDirty'),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'statusIsDirty', 'phoneNumbersIsDirty', 'addressesIsDirty', 'emailsIsDirty', 'childrenIsDirty', 'parentsIsDirty', function() {
    return this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('statusIsDirty') || this.get('phoneNumbersIsDirty') || this.get('addressesIsDirty') || this.get('emailsIsDirty') || this.get('childrenIsDirty') || this.get('parentsIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  saveRelated() {
    this.saveLocationLevel();
    this.saveStatus();
    this.saveEmails();
    this.savePhoneNumbers();
    this.saveAddresses();
    this.saveChildren();
    this.saveParents();
  },
  rollback() {
    this.rollbackLocationLevel();
    this.rollbackStatus();
    this.rollbackEmails();
    this.rollbackPhoneNumbers();
    this.rollbackAddresses();
    this.rollbackChildren();
    this.rollbackParents();
    this._super();
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
    var phone_numbers = this.get('phone_numbers').filter(function(num) {
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
      this.get('store').remove('location', this.get('id'));
    });
  },
});

export default LocationModel;
