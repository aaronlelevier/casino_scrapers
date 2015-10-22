import Ember from 'ember';

var TicketCategories = Ember.Component.extend({
    categories_selected: Ember.computed('ticket.top_level_category', function() {
        let ticket = this.get('ticket');
        return ticket.get('top_level_category');
    }),
    options: Ember.computed('ticket_category_options.[]', 'categories_selected', function() {
        if(this.get('ticket_category_options') && this.get('ticket_category_options').get('length') > 0) {
            return this.get('ticket_category_options');
        }else if(this.get('categories_selected')) {
            return Ember.A([this.get('categories_selected')]);
        }
        return Ember.A([]);
        //TODO: regression test the non "new" usage of this
    }),
    actions: {
        selected(category) {
            let ticket = this.get('ticket');
            ticket.change_category_tree(category.get('id'));
        }
    }
});

export default TicketCategories;
