import { attr, Model } from 'ember-cli-simple-store/model';
import Ember from 'ember';
import loopAttrs from 'bsrs-ember/utilities/loop-attrs';
import inject from 'bsrs-ember/utilities/store';

let CategoryModel = Model.extend({
    store: inject('main'),
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
            subcategory_label: this.get('subcategory_label'),
            parent: []
        };
    },
    removeRecord() {
        this.get('store').remove('category', this.get('id'));
    },
    rollbackRelated() {
    },
    isNew: Ember.computed(function() {
        return loopAttrs(this);
    })
});

export default CategoryModel;
