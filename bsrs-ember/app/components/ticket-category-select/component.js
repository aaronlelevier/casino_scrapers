import Ember from 'ember';

var TicketCategories = Ember.Component.extend({
    categories_selected: Ember.computed('ticket.categories.[]', function() {
        let ticket = this.get('ticket');
        return ticket.get('categories');
    }),
    options: Ember.computed('ticket.categories.[]', function() {
        return this.get('ticket_category_options') && this.get('ticket_category_options').get('length') > 0 ? this.get('ticket_category_options') : this.get('categories_selected');
    }),
    find_all_categories() {
        let search_criteria = this.get('search_criteria');
        if (search_criteria) {
            this.set('search_category', search_criteria);
        }
    },
    actions: {
        add(category) {
            let ticket = this.get('ticket');
            ticket.add_category(category.get('id'));
        },
        remove(category) {
            let ticket = this.get('ticket');
            ticket.remove_category(category.get('id'));
        },
        update_filter() {
            Ember.run.debounce(this, this.get('find_all_categories'), 300);
        }
    }
});

export default TicketCategories;
