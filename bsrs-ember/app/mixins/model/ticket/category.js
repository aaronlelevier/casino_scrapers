import Ember from 'ember';

var CategoriesMixin = Ember.Mixin.create({
    top_level_category: Ember.computed('categories.[]', function() {
        return this.get('categories').filter(function(category) {
            return category.get('parent_id') === null;
        }).objectAt(0);
    }),
    categories_ids: Ember.computed('categories.[]', function() {
        return this.get('categories').mapBy('id');
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
    change_top_level_category(category_pk) {
        let store = this.get('store');
        let ticket_pk = this.get('id');
        let m2m_models = this.get('ticket_categories').filter((m2m) => {
            return m2m.get('ticket_pk') === ticket_pk;
        });
        m2m_models.forEach((m2m) => {
            store.push('ticket-category', {id: m2m.get('id'), removed: true});
        });
        let uuid = this.get('uuid');
        store.push('ticket-category', {id: uuid.v4(), ticket_pk: this.get('id'), category_pk: category_pk});
    },
    add_category(category_pk) {
        let uuid = this.get('uuid');
        let store = this.get('store');
        store.push('ticket-category', {id: uuid.v4(), ticket_pk: this.get('id'), category_pk: category_pk});
    },
    remove_category(category_pk) {
        let store = this.get('store');
        let m2m_pk = this.get('ticket_categories').filter((m2m) => {
            return m2m.get('category_pk') === category_pk;
        }).objectAt(0).get('id');
        store.push('ticket-category', {id: m2m_pk, removed: true});
    },
    rollbackCategories() {
        let store = this.get('store');
        let previous_m2m_fks = this.get('ticket_categories_fks') || [];
        let m2m_to_throw_out = store.find('ticket-category', function(join_model) {
            return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed');
        }, ['removed']);
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
        let ticket_categories = this.get('ticket_categories');
        let ticket_categories_ids = this.get('ticket_categories_ids') || [];
        let previous_m2m_fks = this.get('ticket_categories_fks') || [];
        //add
        ticket_categories.forEach((join_model) => {
            if (Ember.$.inArray(join_model.get('id'), previous_m2m_fks) === -1) {
                previous_m2m_fks.pushObject(join_model.get('id'));
            } 
        });
        //remove
        for (let i=previous_m2m_fks.length-1; i>=0; --i) {
            if (Ember.$.inArray(previous_m2m_fks[i], ticket_categories_ids) === -1) {
                previous_m2m_fks.removeObject(previous_m2m_fks[i]);
            } 
        }
    },
});

export default CategoriesMixin;

