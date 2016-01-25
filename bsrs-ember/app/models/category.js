import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import equal from 'bsrs-ember/utilities/equal';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import NewMixin from 'bsrs-ember/mixins/model/new';
import TranslationMixin from 'bsrs-ember/mixins/model/translation';

var run = Ember.run;

var CategoryModel = Model.extend(NewMixin, TranslationMixin, {
    store: inject('main'),
    uuid: injectUUID('uuid'),
    name: attr(''),
    description: attr(''),
    label: attr(''),
    subcategory_label: attr(''),
    cost_amount: attr(''),
    cost_code: attr(''),
    parent_id: undefined,
    children_fks: [],
    previous_children_fks: [],
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'childrenIsDirty', function() {
        return this.get('isDirty') || this.get('childrenIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    serialize() {
        const cost_amount = this.get('cost_amount') || null;
        return {
            id: this.get('id'),
            name: this.get('name'),
            description: this.get('description'),
            cost_amount: cost_amount,
            cost_currency: this.get('cost_currency'),
            cost_code: this.get('cost_code'),
            label: this.get('label'),
            subcategory_label: this.get('subcategory_label'),
            parent: null,
            children: this.get('children_fks')
        };
    },
    childrenIsDirty: Ember.computed('children_fks.[]', 'previous_children_fks.[]', function() {
        let child_ids = this.get('child_ids') || [];
        let previous_children_fks = this.get('previous_children_fks') || [];
        if(child_ids.get('length') !== previous_children_fks.get('length')) {
            return true;
        }
        return equal(child_ids, previous_children_fks) ? false : true;
    }),
    childrenIsNotDirty: Ember.computed.not('childrenIsDirty'),
    has_many_children: Ember.computed('children_fks.[]', function() {
        const related_fks = this.get('children_fks');
        const filter = function(cat) {
            return Ember.$.inArray(cat.get('id'), related_fks) > -1;
        };
        return this.get('store').find('category', filter);
    }),
    child_ids: Ember.computed('has_many_children.[]', function() {
        return this.get('has_many_children').mapBy('id');
    }),
    parent: Ember.computed.alias('parent_belongs_to.firstObject'),
    parent_belongs_to: Ember.computed('parent_id', function() {
        const parent_id = this.get('parent_id');
        const store = this.get('store');
        const filter = function(category) {
            return parent_id === category.get('id');
        };
        return store.find('category', filter);
    }),
    add_child(child_pk) {
        let related_fks = this.get('children_fks');
        this.set('children_fks', related_fks.concat(child_pk).uniq());
    },
    remove_child(child_pk) {
        let related_fks = this.get('children_fks');
        let updated_fks = related_fks.filter((fk) => {
            return fk !== child_pk;
        });
        this.set('children_fks', updated_fks);
    },
    removeRecord() {
        run(() => {
            this.get('store').remove('category', this.get('id'));
        });
    },
    rollbackChildren() {
        let children_fks = this.get('children_fks');
        let prev_children_fks = this.get('previous_children_fks');
        children_fks.forEach((id) => {
            this.remove_child(id);
        });
        prev_children_fks.forEach((id) => {
            this.add_child(id);
        });
    },
    saveChildren() {
        this.set('previous_children_fks', this.get('children_fks'));
    },
    rollbackRelated() {
        this.rollbackChildren();
    },
    saveRelated() {
        this.saveChildren();
    }
});

export default CategoryModel;
