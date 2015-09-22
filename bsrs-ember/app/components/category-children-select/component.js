import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';

var CategoryChildrenSelect = Ember.Component.extend({
    repository: inject('category'),
    store: injectStore('main'),
    categories_selected: Ember.computed(function() {
        let category = this.get('category');
        return category.get('children') || [];
    }),
    options_proxy: function() {
        let categories_selected = this.get('categories_selected');
        let mix = categories_selected.map((cat) => {
            return Ember.$.extend(true, {}, cat);
        });
        return Ember.ArrayProxy.extend({
          content: Ember.computed(function () {
            return Ember.A(this.get('source'));
          }).property()
        }).create({
          source: mix
        });
    },
    find_repo_categories: Ember.computed(function() {
        let repo = this.get('repository');
        let search_criteria = this.get('search_criteria');
        let categories = repo.findCategoryChildren(search_criteria);
        return categories.filter((cat) => {
            return cat.get('id') !== this.get('category.id');
        });
    }),
    options: Ember.computed('search_criteria', function() {
        //debounce not working b/c options cache breaks right away
        //can't have template bound array proxy beause need to only send selected categories if no search criteria.  Don't want to populate dropdown, even if click into it
        //without typing anything
        //return this.get('store').find('category');
        let search_criteria = this.get('search_criteria');
        let options_proxy = this.options_proxy();
        let categories = search_criteria ? this.get('find_repo_categories') : this.get('categories_selected');
        categories.forEach((cat) => {
            options_proxy.pushObject(cat);
        });
        return options_proxy;
    }),
    find_all_categories() {
        this.get('options'); 
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
