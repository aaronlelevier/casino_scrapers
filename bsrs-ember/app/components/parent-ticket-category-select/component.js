import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import ChildValidationComponent from 'bsrs-ember/mixins/validation/child';

var ParentTicketCategorySelect = ChildValidationComponent.extend({
    repository: inject('category'),
    valid: Ember.computed('ticket.categories.[]', function() {
        let ticket = this.get('ticket');
        let categories = ticket.get('categories') || [];
        if(categories.get('length') < 1) {
            return false;
        }
        let parent = ticket.get('top_level_category');
        let tree = ticket.construct_category_tree(parent);
        return tree ? !tree.pop().get('has_children') : true;
    }),
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
