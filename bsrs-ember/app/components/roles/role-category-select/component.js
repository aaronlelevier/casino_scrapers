import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

const PREFIX = config.APP.NAMESPACE;
const CATEGORY_URL = PREFIX + '/admin/categories/';

var RoleCategorySelect = Ember.Component.extend({
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
                if (!old_category_ids.includes(cat.id)) {
                    role.add_category(cat);
                }
            });
            old_categories.forEach((cat) => {
                if (Ember.$.inArray(cat.get('id'), new_category_ids) < 0) {
                    role.remove_category(cat.get('id'));
                }
            });
        },
        handleOpen() {
            const url = `${CATEGORY_URL}parents/`;
            const _this = this;
            PromiseMixin.xhr(url, 'GET').then((response) => {
                _this.set('options', response.results);
            });
        }
    }
});

export default RoleCategorySelect;
