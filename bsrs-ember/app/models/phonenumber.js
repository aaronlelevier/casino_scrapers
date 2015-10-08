import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

var PhoneNumberModel =  Model.extend({
    type: attr(),
    number: attr(''),
    person_fk: undefined,
    invalid_number: Ember.computed('number', function() {
        let number = this.get('number');
        return typeof number === 'undefined' || number.trim() === '';
    }),
    serialize() {
        return {id: this.get('id'), number: this.get('number'), type: this.get('type')};
    }
});

export default PhoneNumberModel;
