import Ember from 'ember';

var TicketTopLevelCategories = Ember.Component.extend({
    categories_selected: Ember.computed('ticket.top_level_category', function() {
        let ticket = this.get('ticket');
        return ticket.get('top_level_category');
    }),
    options: Ember.computed('ticket_category_options.[]', 'categories_selected', function() {
        return this.get('ticket_category_options') && this.get('ticket_category_options').get('length') > 0 ? this.get('ticket_category_options') : Ember.A([this.get('categories_selected')]);
    }),
    actions: {
        selected(category) {
            let ticket = this.get('ticket');
            ticket.change_top_level_category(category.get('id'));
        },
    }
});

export default TicketTopLevelCategories;
