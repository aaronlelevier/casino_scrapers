import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';

var CategoryChildrenSelect = Ember.Component.extend({
    repository: inject('category'),
    store: injectStore('main'),
    categories_selected: Ember.computed('role.category_fks.[]', function() {
        let role = this.get('role');
        return role.get('categories') || [];
    }),
    options: Ember.computed('categories_selected.[]', 'search', function() {
        let categories_selected = this.get('categories_selected');
        let categories_children = this.get('categories_children') || [];
        let category_fks = this.get('role.category_fks');
        let mix = categories_selected.map((category) => {
            return Ember.$.extend(true, {}, category);
        });
        return Ember.ArrayProxy.extend({
          content: Ember.computed(function () {
            let mix = Ember.A(this.get('source'));
            categories_children.forEach((cat) => {
                if (Ember.$.inArray(cat.get('id'), category_fks) === -1) { 
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
            // let role = this.get('role');
            // let category_id = category_child.get('id');
            // role.add_category(category_id);
        },
        remove(category_child) {
            // let role = this.get('role');
            // let category_id = category_child.get('id');
            // role.remove_category(category_id);
        },
        update_filter() {
            Ember.run.debounce(this, this.get('find_all_categories'), 300);
        }
    }
});

export default CategoryChildrenSelect;
