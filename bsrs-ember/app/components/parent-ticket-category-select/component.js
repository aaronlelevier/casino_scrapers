import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var ParentTicketCategorySelectComponent = Ember.Component.extend({
    repository: inject('category'),
    valid: Ember.computed('ticket.categories.[]', function() {
        let ticket = this.get('ticket');
        let categories = ticket.get('categories');
        if(categories.get('length') < 1) {
            return false;
        }
        let parent = ticket.get('top_level_category');
        // let legit = true;
        // categories.forEach(function(category) {
        //     legit = category.get('children').get('length') < 1;
        // });
        // return legit;
    }),
    actions: {
        selected_category(category_pk) {
            this.get('repository').findById(category_pk);
        }
    }
});

export default ParentTicketCategorySelectComponent;
