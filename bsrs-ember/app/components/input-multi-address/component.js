import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import ChildValidationComponent from 'bsrs-ember/mixins/validation/child';
import CustomValidMixin from 'bsrs-ember/mixins/validation/custom';
import {ValidationMixin, validateEach} from 'ember-cli-simple-validation/mixins/validate';
import addressNameValidation from 'bsrs-ember/validation/address_name';
import postalCodeValidation from 'bsrs-ember/validation/postal_code';
import injectRepo from 'bsrs-ember/utilities/inject';

const { run } = Ember;

var MultiAddressComponent = ChildValidationComponent.extend(ValidationMixin, CustomValidMixin, {
  uuid: inject('uuid'),
  simpleStore: Ember.inject.service(),
  countryDbFetch: injectRepo('country-db-fetch'),
  stateDbFetch: injectRepo('state-db-fetch'),
  address_types: Ember.computed(function() {
    return this.get('simpleStore').find('address-type');
  }),
  tagName: 'div',
  classNames: ['input-multi-address t-input-multi-address'],
  addressFormat: validateEach('address', addressNameValidation),
  postal_codeFormat: validateEach('postal_code', postalCodeValidation),
  actions: {
    changed(address, val) {
      address.set('type', val);
    },
    append() {
      const id = this.get('uuid').v4();
      const type = this.get('default_type').get('id');
      const related_pk = this.get('related_pk');
      var model = {id: id, type: type};
      model['model_fk'] = related_pk;
      run(() => {
        this.get('model').push(model);
      });
    },
    delete(entry) {
      run(() => {
        this.get('model').push({id: entry.get('id'), removed: true});
      });
    },
  }
});

export default MultiAddressComponent;
