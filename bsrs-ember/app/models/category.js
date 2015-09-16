import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { attr, Model } from 'ember-cli-simple-store/model';

var CategoryModel = Model.extend(NewMixin, {
    store: inject('main'),
    name: attr(''),
    description: attr(''),
    label: attr(''),
    cost_amount: attr(''),
    cost_code: attr(''),
    children_fks: [],
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
            parent: [],
            children: this.get('children_fks')
        };
    },
    children: Ember.computed(function() {
        let store = this.get('store');
        let filter = (category) => {
            let children_fks = this.get('children_fks') || [];
            if (Ember.$.inArray(category.get('id'), children_fks) > -1) { 
                return true; 
            }
            return false;
        };
        return store.find('category', filter.bind(this), ['children_fks']);
    }),
    removeRecord() {
        this.get('store').remove('category', this.get('id'));
    },
    rollbackRelated() {
    }
});

export default CategoryModel;
