import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var CategoryChildrenSelect = Ember.Component.extend({
    repository: inject('category'),
    categories_selected: Ember.computed('category.has_many_children.[]', function() {
        let category = this.get('category');
        return category.get('has_many_children');
    }),
    actions: {
        change_children(new_categories) {
            const category = this.get('category');
            const old_children = category.get('has_many_children');
            const old_children_ids = old_children.mapBy('id');
            const new_children_ids = new_categories.mapBy('id');
            new_categories.forEach((cat) => {
                if (Ember.$.inArray(cat.get('id'), old_children_ids) < 0) {
                    category.add_child(cat.get('id'));
                } 
            });
            old_children.forEach((old_cat) => {
                if (Ember.$.inArray(old_cat.get('id'), new_children_ids) < 0) {
                    category.remove_child(old_cat.get('id'));
                }
            });
        },
        update_filter(search) {
            const repo = this.get('repository');
            return new Ember.RSVP.Promise((resolve, reject) => {
                Ember.run.later(() => {
                    if (Ember.isBlank(search)) { return resolve([]); }
                    resolve(repo.findCategoryChildren(search));
                }, 300);
            });
        }
    }
});

export default CategoryChildrenSelect;
