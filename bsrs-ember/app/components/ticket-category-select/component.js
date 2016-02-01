import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

const PREFIX = config.APP.NAMESPACE;
const CATEGORY_URL = PREFIX + '/admin/categories/';

var TicketCategories = Ember.Component.extend({
    classNames: ['ticket-category-wrap'],
    categories_selected: Ember.computed('ticket.top_level_category', 'ticket.categories.[]', function() {
        let index = this.get('index');
        let ticket = this.get('ticket');
        let categories = ticket.get('sorted_categories');
        let top_level_category = ticket.get('top_level_category');
        if (!index) {
            return top_level_category;
        } else {
            if (categories) {
                return ticket.get('sorted_categories').objectAt(`${index}`);
            }
        }
    }),
    options: Ember.computed('ticket_category_options.[]', function() {
        let options = this.get('ticket_category_options');
        if (options && options.get('length') > 0) {
            return options;
        }
    }),
    actions: {
        selected(category) {
            const ticket = this.get('ticket');
            const cat_ids = ticket.get('categories_ids');
            if(Ember.$.inArray(category.id, cat_ids) === -1){
                ticket.change_category_tree(category);
            }
        },
        handleOpen(category_parent_id) {
            const url = `${CATEGORY_URL}?parent=${category_parent_id}`;
            const _this = this;
            PromiseMixin.xhr(url, 'GET').then((response) => {
                _this.set('options', response.results);
            });
        }
    }
});

export default TicketCategories;
