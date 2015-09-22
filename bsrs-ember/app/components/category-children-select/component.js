import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';

var CategoryChildrenSelect = Ember.Component.extend({
    repository: inject('category'),
    store: injectStore('main'),
    categories_selected: Ember.computed(function() {
        let category = this.get('category');
        return category.get('children');
    }),
    options: Ember.computed(function() {
        return this.get('store').find('category');
    }),
    find_all_categories() {
        let repo = this.get('repository');
        let search_criteria = this.get('search_criteria');
        repo.findCategoryChildren(search_criteria);
    },
    actions: {
        add(category_child) {
            let category = this.get('category');
            let category_id = category_child.get('id');
            category.add_child(category_id);
        },
        remove(category_child) {
            let category = this.get('category');
            let category_id = category_child.get('id');
            category.remove_child(category_id);
        },
        update_filter() {
            Ember.run.debounce(this, this.get('find_all_categories'), 300);
        }
    }
});

export default CategoryChildrenSelect;
