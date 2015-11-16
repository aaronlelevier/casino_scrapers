import Ember from 'ember';

var TicketCategories = Ember.Component.extend({
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
            let ticket = this.get('ticket');
            let category_id = category.get('id');
            ticket.change_category_tree(category_id);
            this.sendAction('selected_category', category);
            // let category_remove = this.get('categories_selected');
            // ticket.remove_categories_down_tree(category_remove.get('id'));
        }
    }
});

export default TicketCategories;
