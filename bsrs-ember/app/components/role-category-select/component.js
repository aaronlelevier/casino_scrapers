import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import inject from 'bsrs-ember/utilities/inject';

var RoleCategorySelect = Ember.Component.extend({
    repository: inject('category'),
    categories_selected: Ember.computed('role.role_categories.[]', function() {
        let role = this.get('role');
        return role.get('categories');
    }),
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
            const repo = this.get('repository');
            return new Ember.RSVP.Promise((resolve, reject) => {
                Ember.run.later(() => {
                    if (Ember.isBlank(search)) { return resolve([]); }
                    resolve(repo.findCategoryChildren(search));
                }, config.DEBOUNCE_TIMEOUT_INTERVAL);
            });
        }
    }
});

export default RoleCategorySelect;
