import Ember from 'ember';

var RoleCategorySelect = Ember.Component.extend({
    categories_selected: Ember.computed('role.role_categories.[]', function() {
        let role = this.get('role');
        return role.get('categories');
    }),
    options: Ember.computed('role.categories.[]', 'search', function() {
        return this.get('categories_children') && this.get('categories_children').get('length') > 0 ? this.get('categories_children') : this.get('categories_selected');
    }),
    find_all_categories() {
        let search_criteria = this.get('search_criteria');
        if (search_criteria) {
            this.set('search', search_criteria);
        }
    },
    actions: {
        add(category) {
            let role = this.get('role');
            role.add_category(category.get('id'));
        },
        remove(category) {
            let role = this.get('role');
            role.remove_category(category.get('id'));
        },
        update_filter() {
            Ember.run.debounce(this, this.get('find_all_categories'), 300);
        }
    }
});

export default RoleCategorySelect;
