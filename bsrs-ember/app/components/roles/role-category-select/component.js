import Ember from 'ember';
const { get, set } = Ember;
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

const PREFIX = config.APP.NAMESPACE;
const CATEGORY_URL = PREFIX + '/admin/categories/';

var RoleCategorySelect = Ember.Component.extend({
    categories_selected: Ember.computed('role.role_categories.[]', function() {
        let role = get(this, 'role');
        return get(role, 'categories');
    }),
    actions: {
        change_category(new_categories) {
            const role = get(this, 'role');
            const old_categories = get(role, 'categories');
            const old_category_ids = get(role, 'categories_ids');
            const new_category_ids = new_categories.mapBy('id');
            new_categories.forEach((cat) => {
                if (!old_category_ids.includes(cat.id)) {
                    role.add_category(cat);
                }
            });
            old_categories.forEach((cat) => {
                if (!new_category_ids.includes(get(cat, 'id'))) {
                    role.remove_category(get(cat, 'id'));
                }
            });
        },
        handleOpen() {
            const url = `${CATEGORY_URL}parents/`;
            PromiseMixin.xhr(url, 'GET').then((response) => {
                set(this, 'options', response.results);
            });
        }
    }
});

export default RoleCategorySelect;
