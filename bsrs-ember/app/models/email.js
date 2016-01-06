import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

var EmailModel =  Model.extend({
    type: attr(),
    email: attr(''),
    model_fk: undefined,
    invalid_email: Ember.computed('email', function() {
        let email = this.get('email');
        return typeof email === 'undefined' || email.trim() === '';
    }),
    serialize() {
        return {id: this.get('id'), email: this.get('email'), type: this.get('type')};
    }
});

export default EmailModel;
