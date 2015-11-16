import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import { attr, Model } from 'ember-cli-simple-store/model';
import NewMixin from 'bsrs-ember/mixins/model/new';

var CategoryModel = Model.extend(NewMixin, {
    store: inject('main'),
    name: attr(''),
    description: attr(''),
    label: attr(''),
    cost_amount: attr(''),
    cost_code: attr(''),
    parent_id: undefined,
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
            parent: null,
            children: this.get('children_fks')
        };
    },
    children: Ember.computed('children_fks.[]', function() {
        let store = this.get('store');
        let filter = (category) => {
            let children_fks = this.get('children_fks') || [];
            if (Ember.$.inArray(category.get('id'), children_fks) > -1) { 
                return true; 
            }
            return false;
        };
        return store.find('category', filter.bind(this), ['id']);
    }),
    parent: Ember.computed.alias('parent_belongs_to.firstObject'),
    parent_belongs_to: Ember.computed('parent_id', function() {
        const parent_id = this.get('parent_id');
        const store = this.get('store');
        const filter = function(category) {
            return parent_id === category.get('id');
        };
        return store.find('category', filter, ['id']);
    }),
    add_child(category_child_id) {
        let children_fks = this.get('children_fks');
        this.set('children_fks', children_fks.concat(category_child_id)); 
    },
    remove_child(category_child_id) {
        const children_fks = this.get('children_fks');
        let new_children_fks = children_fks.filter((fk) => {
            return fk !== category_child_id;
        });
        this.set('children_fks', new_children_fks); 
    },
    removeRecord() {
        this.get('store').remove('category', this.get('id'));
    },
    rollbackRelated() {
    }
});

export default CategoryModel;
