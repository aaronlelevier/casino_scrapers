import Ember from 'ember';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';

var run = Ember.run;

var CategoriesMixin = Ember.Mixin.create({
    category_names: Ember.computed('sorted_categories.[]', function() {
        const sorted_categories = this.get('sorted_categories') || [];
        const names = sorted_categories.map((category) => {
            return category.get('name');
        }).join(' &#8226; ');
        return Ember.String.htmlSafe(names);
    }),
    construct_category_tree(category, child_nodes=[]) {
        //this method is used for on the fly validation check to see if at end of cat tree
        child_nodes.push(category);
        const children = category ? category.get('has_many_children') : [];
        if(children.get('length') === 0 && child_nodes.get('length') > 1) {
            return;
        }
        if(children.get('length') === 0) {
            return child_nodes.objectAt(0) ? child_nodes : undefined;
        }
        const children_ids = children.mapBy('id');
        const index = this.get('categories_ids').reduce((found, category_pk) => {
            return found > -1 ? found : Ember.$.inArray(category_pk, children_ids);
        }, -1);
        const child = children.objectAt(index);
        this.construct_category_tree(child, child_nodes);
        return child_nodes.filter((node) => {
            return node !== undefined;
        });
    },
    top_level_category: Ember.computed('categories.[]', function() {
        return this.get('categories').filter((category) => {
            return category.get('parent_id') === undefined || category.get('parent_id') === null;
        }).objectAt(0);
    }),
    leaf_category: Ember.computed('categories.[]', function() {
        const sorted_categories = this.get('sorted_categories') || [];
        return sorted_categories[sorted_categories.length-1];
    }),
    categories_ids: many_models_ids('categories'),
    sorted_categories: Ember.computed('categories.[]', 'top_level_category', function() {
        return this.get('categories').sortBy('level');
    }),
    categories: many_models('ticket_categories', 'category_pk', 'category'),
    ticket_categories_ids: many_to_many_ids('ticket_categories'),
    ticket_categories: many_to_many('ticket-category', 'ticket_pk'),
    ticket_categories_with_removed: Ember.computed(function() {
        let filter = function(join_model) {
            return join_model.get('ticket_pk') === this.get('id');
        };
        return this.get('store').find('ticket-category', filter.bind(this));
    }),
    find_parent_nodes(child_pk, parent_ids=[]) {
        if (!child_pk) { return; }
        let child = this.get('store').find('category', child_pk);
        //TODO: check to see if only need to check for parent_id
        let parent_id = child.get('parent.id') || child.get('parent_id');
        if (parent_id) {
            parent_ids.push(parent_id);
        }
        this.find_parent_nodes(child.get('parent.id'), parent_ids);
        return parent_ids;
    },
    remove_categories_down_tree(category_pk) {
        let parent_ids = this.find_parent_nodes(category_pk);
        let store = this.get('store');
        let ticket_pk = this.get('id');
        let m2m_models = this.get('ticket_categories').filter((m2m) => {
            return m2m.get('ticket_pk') === ticket_pk && Ember.$.inArray(m2m.get('category_pk'), parent_ids) === -1;
        });
        m2m_models.forEach((m2m) => {
            run(function() {
                store.push('ticket-category', {id: m2m.get('id'), removed: true});
            });
        });
    },
    change_category_tree(category) {
        const store = this.get('store');
        let pushed_category = store.find('category', category.id);
        if(!pushed_category.get('content') || pushed_category.get('isNotDirtyOrRelatedNotDirty')){
            Ember.set(category, 'previous_children_fks', category.children_fks);
            run(() => {
                pushed_category = store.push('category', category);
            });
            pushed_category.save();
        }
        const category_pk = category.id;
        const parent_ids = this.find_parent_nodes(category_pk);
        const ticket_pk = this.get('id');
        //remove all m2m join models that don't relate to this category pk down the tree
        const m2m_models = this.get('ticket_categories').filter((m2m) => {
            return m2m.get('ticket_pk') === ticket_pk && Ember.$.inArray(m2m.get('category_pk'), parent_ids) === -1;
        });
        m2m_models.forEach((m2m) => {
            run(() => {
                store.push('ticket-category', {id: m2m.get('id'), removed: true});
            });
        });
        //find old m2m models that might exist
        const matching_m2m = this.get('ticket_categories_with_removed').filter((m2m) => {
            return m2m.get('ticket_pk') === ticket_pk && category_pk === m2m.get('category_pk') && m2m.get('removed') === true;
        }).objectAt(0); 
        if (matching_m2m) {
            run(() => {
                store.push('ticket-category', {id: matching_m2m.get('id'), removed: undefined});
            });
        }else{
            run(() => {
                store.push('ticket-category', {id: Ember.uuid(), ticket_pk: ticket_pk, category_pk: category_pk});
            });
        }
    },
    //TODO: add tests
    add_category(category_pk) {
        const ticket_pk = this.get('id');
        const store = this.get('store');
        run(() => {
            store.push('ticket-category', {id: Ember.uuid(), ticket_pk: ticket_pk, category_pk: category_pk});
        });
    },
    remove_category: remove_many_to_many('ticket-category', 'category_pk', 'ticket_categories'),
    rollbackCategories: many_to_many_rollback('ticket-category', 'ticket_categories_fks', 'ticket_pk'),
    // saveCategories: many_to_many_save('ticket_categories', 'ticket_categories_ids', 'ticket_categories'),
    saveCategories() {
        let ticket_pk = this.get('id');
        let saved_m2m_pks = [];
        let store = this.get('store');
        let categories = this.get('categories');
        categories.forEach((category) => {
            let m2m_array = store.find('ticket-category').toArray();
            let m2m = m2m_array.filter(function(category_model, join_model) {
                let removed = join_model.get('removed');
                let ticket_pk = join_model.get('ticket_pk');
                let category_pk = join_model.get('category_pk');
                return ticket_pk === this.get('id') && category_pk === category_model.get('id') && !removed;
            }.bind(this, category));
            m2m.forEach(function(join_model) {
                saved_m2m_pks.push(join_model.get('id'));
            });
        });
        run(function() {
            store.push('ticket', {id: ticket_pk, ticket_categories_fks: saved_m2m_pks});
        });
    },
});

export default CategoriesMixin;
