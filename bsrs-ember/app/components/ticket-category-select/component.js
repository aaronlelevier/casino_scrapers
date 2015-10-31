import Ember from 'ember';

var TicketCategories = Ember.Component.extend({
    categories_selected: Ember.computed('ticket.top_level_category', function() {
        let index = this.get('index');
        let ticket = this.get('ticket');
        let categories = ticket.get('categories');
        let top_level_category = ticket.get('top_level_category');
        index++;
        if (!index) {
            return top_level_category;
        } else {
            if (categories) {
                return ticket.get('categories').objectAt(`${index}`);
            }
        }
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
            //TODO: need to figure out how to clear tree when cat is null
            // if (category) {
                let category_id = category.get('id');
                let ticket = this.get('ticket');
                ticket.change_category_tree(category_id);
                //TODO: detail route not resolving/or pushing down the resolved ticket model (still object proxy)
                this.sendAction('selected_category', category_id);
            // }
        }
    }
});

export default TicketCategories;
