import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/uuid';
import injectRepo from 'bsrs-ember/utilities/inject';


var MultiAddressComponent = Ember.Component.extend({
  uuid: inject('uuid'),
  simpleStore: Ember.inject.service(),
  countryDbFetch: injectRepo('country-db-fetch'),
  stateDbFetch: injectRepo('state-db-fetch'),
  address_type_repo: injectRepo('address-type'),
  address_types: Ember.computed(function() {
    return this.get('simpleStore').find('address-type');
  }),
  tagName: 'div',
  classNames: ['input-multi-address t-input-multi-address'],
  actions: {
    append() {
      const id = this.get('uuid').v4();
      const default_type = this.get('address_type_repo').get_default();
      const type_id = default_type.get('id');
      var model = {id: id, address_type_fk: type_id};
      run(() => {
        this.get('model').add_address(model);
      });
      const new_address = this.get('simpleStore').find('address', id);
      new_address.change_address_type({ id: default_type.get('id') });
    },
    delete(entry) {
      run(() => {
        this.get('model').remove_address(entry.get('id'));
      });
    },
  }
});

export default MultiAddressComponent;
