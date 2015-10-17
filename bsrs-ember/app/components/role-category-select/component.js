import Ember from 'ember';

var RoleCategorySelect = Ember.Component.extend({
    categories_selected: Ember.computed('role.role_categories.[]', function() {
        let role = this.get('role');
        return role.get('categories');
    }),
    options: Ember.computed('role.categories.[]', 'search', function() {
        let categories_selected = this.get('categories_selected');
        let categories_children = this.get('categories_children');
        if (!categories_children || categories_children.get('length') === 0) { 
            return categories_selected; 
        }
        categories_selected.map((selected) => {
            categories_children.pushObject(selected); 
        });
        return categories_children;
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
