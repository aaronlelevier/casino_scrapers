import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import NewMixin from 'bsrs-ember/mixins/model/new';
import loopAttrs from 'bsrs-ember/utilities/loop-attrs';
import { attr, Model } from 'ember-cli-simple-store/model';

var CategoryModel = Model.extend(NewMixin, {
    store: inject('main'),
    name: attr(''),
    description: attr(''),
    label: attr(''),
    cost_amount: attr(''),
    cost_code: attr(''),
    dirtyOrRelatedDirty: Ember.computed('dirty', function() {
        return this.get('dirty');
    }),
    notDirtyOrRelatedNotDirty: Ember.computed.not('dirtyOrRelatedDirty'),
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
