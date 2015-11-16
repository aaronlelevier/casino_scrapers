import Ember from 'ember';

var RoleCategorySelect = Ember.Component.extend({
    categories_selected: Ember.computed('role.role_categories.[]', function() {
        let role = this.get('role');
        return role.get('categories');
    }),
    options: Ember.computed('categories_children.[]', 'role.categories.[]', 'search', function() {
        let options = this.get('categories_children');
        if (options && options.get('length') > 0) {
            return options;
        }
    }),
    find_all_categories(search) {
        this.set('search', search);
    },
    actions: {
        change_category(new_categories) {
            const role = this.get('role');
            const old_categories = role.get('categories');
            const old_category_ids = role.get('categories_ids');
            const new_category_ids = new_categories.mapBy('id');
            new_categories.forEach((cat) => {
                if (Ember.$.inArray(cat.get('id'), old_category_ids) < 0) {
                    role.add_category(cat.get('id'));
                }
            });
            old_categories.forEach((cat) => {
                if (Ember.$.inArray(cat.get('id'), new_category_ids) < 0) {
                    role.remove_category(cat.get('id'));
                }
            });
        },
        update_filter(search) {
            Ember.run.debounce(this, this.get('find_all_categories'), search, 300);
        }
    }
});

export default RoleCategorySelect;
