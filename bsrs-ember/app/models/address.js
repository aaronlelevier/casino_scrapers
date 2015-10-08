import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

var AddressModel = Model.extend({
    type: attr(),
    address: attr(''),
    city: attr(),
    state: attr(),
    postal_code: attr(),
    country: attr(),
    person_fk: undefined,
    invalid_address: Ember.computed('address', function() {
        let address = this.get('address');
        return typeof address === 'undefined' || address.trim() === '';
    }),
    serialize() {
        return {id: this.get('id'), type: this.get('type'), address: this.get('address'), city: this.get('city'), state: this.get('state'), 
            postal_code: this.get('postal_code'), country: this.get('country')};
    }
});

export default AddressModel;
