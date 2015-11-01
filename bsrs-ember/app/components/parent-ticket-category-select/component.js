import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var ParentTicketCategorySelect = Ember.Component.extend({
    repository: inject('category'),
    actions: {
        selected_category(category) {
            if (!category.get('has_children')) {
                return;
            }
            this.get('repository').findById(category.get('id'));
        }
    }
});

export default ParentTicketCategorySelect;
