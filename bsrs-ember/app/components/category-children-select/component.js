import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';

var CategoryChildrenSelect = Ember.Component.extend({
    store: injectStore('main'),
    categories_selected: Ember.computed(function() {
        let category = this.get('category');
        return category.get('children') || [];
    }),
    options: Ember.computed('categories_selected.[]', 'search', function() {
        let category = this.get('category');
        let categories_selected = this.get('categories_selected');
        let categories_children = this.get('categories_children') || [];
        let mix = categories_selected.map((category) => {
            return Ember.$.extend(true, {}, category);
        });
        return Ember.ArrayProxy.extend({
          content: Ember.computed(function () {
            let mix = this.get('source');
            categories_children.forEach((cat) => {
                if (cat.get('id') !== category.get('id')) {
                    mix.pushObject(cat);
                }
            });
            return mix;
          }).property('categories_children.[]')
        }).create({
          source: mix
        });
    }),
    find_all_categories() {
        let search_criteria = this.get('search_criteria');
        if (search_criteria) {
            this.set('search', search_criteria);
        }
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
