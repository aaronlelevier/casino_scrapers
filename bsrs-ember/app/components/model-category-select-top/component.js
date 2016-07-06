import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

const PREFIX = config.APP.NAMESPACE;
const CATEGORY_URL = PREFIX + '/admin/categories/';

var TicketCategories = Ember.Component.extend({
  classNames: ['input-group category'],
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
    const options = this.get('ticket_category_options');
    if (options && options.get('length') > 0) {
      return options;
    }
  }),
  actions: {
    selected(category) {
      const ticket = this.get('ticket');
      const top_level_id = ticket.get('top_level_category.id');
      if(!category) {
        ticket.remove_categories_down_tree(top_level_id);
        return;
      }
      const category_id = category.id;
      //TODO: need to prevent select same b/c plain JS vs hydrated obj
      if(category_id === top_level_id){
        return;
      }
      ticket.change_category_tree(category);
    },
    handleOpen() {
      const url = CATEGORY_URL + 'parents/';
      const _this = this;
      PromiseMixin.xhr(url, 'GET').then((response) => {
        _this.set('options', response.results);
      });
    }
  }
});

export default TicketCategories;
