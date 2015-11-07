import Ember from 'ember';

var CategoriesMixin = Ember.Mixin.create({
    construct_category_tree(category, child_nodes=[]) {
        child_nodes.push(category);
        const children = category ? category.get('children') : [];
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
        return this.get('store').find('category', filter.bind(ticket_categories), []);
    }),
    ticket_categories_ids: Ember.computed('ticket_categories.[]', function() {
        return this.get('ticket_categories').mapBy('id'); 
    }),
    ticket_categories: Ember.computed(function() {
        let filter = function(join_model) {
            return join_model.get('ticket_pk') === this.get('id') && !join_model.get('removed');
        };
        let store = this.get('store');
        return store.find('ticket-category', filter.bind(this), ['removed']);
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
            store.push('ticket-category', {id: m2m.get('id'), removed: true});
        });
    },
    change_category_tree(category_pk) {
        let parent_ids = this.find_parent_nodes(category_pk);
        const store = this.get('store');
        const ticket_pk = this.get('id');
        //remove all m2m join models that don't relate to this category pk
        let m2m_models = this.get('ticket_categories').filter((m2m) => {
            return m2m.get('ticket_pk') === ticket_pk && Ember.$.inArray(m2m.get('category_pk'), parent_ids) === -1;
        });
        m2m_models.forEach((m2m) => {
            store.push('ticket-category', {id: m2m.get('id'), removed: true});
        });
        const uuid = this.get('uuid');
        store.push('ticket-category', {id: uuid.v4(), ticket_pk: this.get('id'), category_pk: category_pk});
    },
    add_category(category_pk) {
        const uuid = this.get('uuid');
        const store = this.get('store');
        store.push('ticket-category', {id: uuid.v4(), ticket_pk: this.get('id'), category_pk: category_pk});
    },
    remove_category(category_pk) {
        const store = this.get('store');
        let m2m_pk = this.get('ticket_categories').filter((m2m) => {
            return m2m.get('category_pk') === category_pk;
        }).objectAt(0).get('id');
        store.push('ticket-category', {id: m2m_pk, removed: true});
    },
    rollbackCategories() {
        const store = this.get('store');
        let previous_m2m_fks = this.get('ticket_categories_fks') || [];
        let m2m_to_throw_out = store.find('ticket-category', function(join_model) {
            return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed');
        }, ['id']);
        m2m_to_throw_out.forEach(function(join_model) {
            join_model.set('removed', true);
        });
        previous_m2m_fks.forEach(function(pk) {
            var m2m_to_keep = store.find('ticket-category', pk);
            if (m2m_to_keep.get('id')) {
                m2m_to_keep.set('removed', undefined);
            }
        });
    },
    saveCategories() {
        let saved_m2m_pks = [];
        let store = this.get('store');
        let categories = this.get('categories');
        categories.forEach((category) => {
            let filter = function(category_model, join_model) {
                let removed = join_model.get('removed');
                let ticket_pk = join_model.get('ticket_pk');
                let category_pk = join_model.get('category_pk');
                return ticket_pk === this.get('id') &&
                    category_pk === category_model.get('id') && !removed;
            };
            let m2m = store.find('ticket-category', filter.bind(this, category), ['removed']);
            m2m.forEach(function(join_model) {
                saved_m2m_pks.push(join_model.get('id'));
            });
        });
        this.set('ticket_categories_fks', saved_m2m_pks);
        // let ticket_categories = this.get('ticket_categories');
        // let ticket_categories_ids = this.get('ticket_categories_ids') || [];
        // let previous_m2m_fks = this.get('ticket_categories_fks') || [];
        // //add
        // ticket_categories.forEach((join_model) => {
        //     if (Ember.$.inArray(join_model.get('id'), previous_m2m_fks) === -1) {
        //         previous_m2m_fks.pushObject(join_model.get('id'));
        //     } 
        // });
        // //remove
        // for (let i=previous_m2m_fks.length-1; i>=0; --i) {
        //     if (Ember.$.inArray(previous_m2m_fks[i], ticket_categories_ids) === -1) {
        //         previous_m2m_fks.removeObject(previous_m2m_fks[i]);
        //     } 
        // }
    },
});

export default CategoriesMixin;

