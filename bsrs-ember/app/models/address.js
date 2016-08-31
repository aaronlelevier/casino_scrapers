import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConf from 'bsrs-ember/mixins/optconfigure/address';

var AddressModel = Model.extend(OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('country', 'address');
    belongs_to.bind(this)('state', 'address');
    belongs_to.bind(this)('address_type', 'address');
  },
  simpleStore: Ember.inject.service(),
  address: attr(''),
  city: attr(''),
  postal_code: attr(''),
  person_fk: undefined,
  invalid_address: Ember.computed('address', function() {
    let address = this.get('address');
    return typeof address === 'undefined' || address.trim() === '';
  }),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'countryIsDirty', 'stateIsDirty', 'addressTypeIsDirty', function() {
    return this.get('isDirty') || this.get('countryIsDirty') || this.get('stateIsDirty') || this.get('addressTypeIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  changeCountry(item) {
    this.set('country', item);
  },
  saveRelated() {
    this.saveCountry();
    this.saveState();
    this.saveAddressType();
  },
  rollback() {
    this.rollbackCountry();
    this.rollbackState();
    this.rollbackAddressType();
    this._super(...arguments);
  },
  serialize() {
    return {
      id: this.get('id'),
      type: this.get('address_type.id'),
      address: this.get('address'),
      city: this.get('city'),
      state: this.get('state.id'),
      postal_code: this.get('postal_code'),
      country: this.get('country.id')
    };
  }
});

export default AddressModel;