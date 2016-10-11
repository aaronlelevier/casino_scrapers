import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import { CATEGORIES_URL } from 'bsrs-ember/utilities/urls';

var TicketCategories = Ember.Component.extend({
  classNames: ['category'],
  label: Ember.computed('ticket.categories.[]', function() {
    return this.get('categories_selected.label') || this.get('category.subcategory_label');
  }),
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
      if(!category) {
        const index = this.get('index');
        const category = ticket.get('sorted_categories').objectAt(`${index}`);
        const category_id = category.get('id');
        ticket.remove_categories_down_tree(category_id);
        return;
      }
      const cat_ids = ticket.get('categories_ids');
      if(!cat_ids.includes(category.id)){
        ticket.change_category_tree(category);
      }
    },
    handleOpen(category_parent_id) {
      const url = `${CATEGORIES_URL}?parent=${category_parent_id}&page_size=1000`;
      const _this = this;
      PromiseMixin.xhr(url, 'GET').then((response) => {
        _this.set('options', response.results);
      });
    }
  }
});

export default TicketCategories;
