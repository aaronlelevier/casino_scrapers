import Ember from 'ember';

var run = Ember.run;

var CategoriesMixin = Ember.Mixin.create({
    construct_category_tree(category, child_nodes=[]) {
        child_nodes.push(category);
        const children = category ? category.get('has_many_children') : [];
        if(children.get('length') === 0) {
            return;
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
    categories_ids: Ember.computed('categories.[]', function() {
        return this.get('categories').mapBy('id');
    }),
    sorted_categories: Ember.computed('categories.[]', 'top_level_category', function() {
        const top_level_category = this.get('top_level_category');
        const categories = this.construct_category_tree(top_level_category);
        return categories;
    }),
    categories: Ember.computed('ticket_categories.[]', function() {
        let ticket_categories = this.get('ticket_categories');
        let filter = function(category) {
            let category_pks = this.mapBy('category_pk');
            return Ember.$.inArray(category.get('id'), category_pks) > -1;
        };
        return this.get('store').find('category', filter.bind(ticket_categories));
    }),
    ticket_categories_ids: Ember.computed('ticket_categories.[]', function() {
        return this.get('ticket_categories').mapBy('id'); 
    }),
    ticket_categories: Ember.computed(function() {
        let filter = function(join_model) {
            return join_model.get('ticket_pk') === this.get('id') && !join_model.get('removed');
        };
        let store = this.get('store');
        return store.find('ticket-category', filter.bind(this));
    }),
    ticket_categories_with_removed: Ember.computed(function() {
        let filter = function(join_model) {
            return join_model.get('ticket_pk') === this.get('id');
        };
        let store = this.get('store');
        return store.find('ticket-category', filter.bind(this));
    }),
    find_parent_nodes(child_pk, parent_ids=[]) {
        if (!child_pk) { return; }
        let child = this.get('store').find('category', child_pk);
        let parent_id = child.get('parent.id');
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
    change_category_tree(category_pk) {
        let parent_ids = this.find_parent_nodes(category_pk);
        const store = this.get('store');
        const ticket_pk = this.get('id');
        //remove all m2m join models that don't relate to this category pk
        const m2m_models = this.get('ticket_categories').filter((m2m) => {
            return m2m.get('ticket_pk') === ticket_pk && Ember.$.inArray(m2m.get('category_pk'), parent_ids) === -1;
        });
        m2m_models.forEach((m2m) => {
            run(function() {
                store.push('ticket-category', {id: m2m.get('id'), removed: true});
            });
        });
        const matching_m2m = this.get('ticket_categories_with_removed').filter((m2m) => {
            return m2m.get('ticket_pk') === ticket_pk && category_pk === m2m.get('category_pk') && m2m.get('removed') === true;
        }).objectAt(0); 
        if (matching_m2m) {
            run(function() {
                store.push('ticket-category', {id: matching_m2m.get('id'), removed: undefined});
            });
        }else{
            run(function() {
                store.push('ticket-category', {id: Ember.uuid(), ticket_pk: ticket_pk, category_pk: category_pk});
            });
        }
    },
    add_category(category_pk) {
        const ticket_pk = this.get('id');
        const store = this.get('store');
        run(function() {
            store.push('ticket-category', {id: Ember.uuid(), ticket_pk: ticket_pk, category_pk: category_pk});
        });
    },
    remove_category(category_pk) {
        const store = this.get('store');
        let m2m_pk = this.get('ticket_categories').filter((m2m) => {
            return m2m.get('category_pk') === category_pk;
        }).objectAt(0).get('id');
        run(function() {
            store.push('ticket-category', {id: m2m_pk, removed: true});
        });
    },
    rollbackCategories() {
        const store = this.get('store');
        const ticket_id = this.get('id');
        let previous_m2m_fks = this.get('ticket_categories_fks') || [];
        let m2m_array = store.find('ticket-category').toArray();
        let m2m_to_throw_out = m2m_array.filter(function(join_model) {
            if(join_model.get('ticket_pk') === ticket_id) {
                return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed');
            }
        });
        m2m_to_throw_out.forEach(function(join_model) {
            run(function() {
                store.push('ticket-category', {id: join_model.get('id'), removed: true});
            });
        });
        previous_m2m_fks.forEach(function(pk) {
            var m2m_to_keep = store.find('ticket-category', pk);
            if (m2m_to_keep.get('id')) {
                run(function() {
                    store.push('ticket-category', {id: m2m_to_keep.get('id'), removed: undefined});
                });
            }
        });
    },
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
