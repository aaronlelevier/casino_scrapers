import { attr, Model } from 'ember-cli-simple-store/model';
import Ember from 'ember';

let CategoryModel = Model.extend({
    name: attr(''),
    description: attr(''),
    label: attr(''),
    cost_amount: attr(''),
    cost_code: attr(''),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        return this.get('isDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            description: this.get('description'),
            cost_amount: this.get('cost_amount'),
            cost_currency: this.get('cost_currency'),
            cost_code: this.get('cost_code'),
            label: this.get('label'),
        };
    }
});

export default CategoryModel;
