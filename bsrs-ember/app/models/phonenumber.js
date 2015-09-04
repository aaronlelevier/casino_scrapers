import Ember from 'ember';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { attr, Model } from 'ember-cli-simple-store/model';

export default Model.extend(NewMixin, {
    type: attr(),
    number: attr(''),
    invalid_number: Ember.computed('number', function() {
        let number = this.get('number');
        return typeof number === 'undefined' || number.trim() === '';
    }),
    serialize() {
        return {id: this.get('id'), number: this.get('number'), type: this.get('type')};
    }
});
