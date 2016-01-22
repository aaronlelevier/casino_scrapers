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
        return tree ? tree.pop().get('children_fks').length === 0 : true;
    }),
    actions: {
        selected_category_top(category) {
            //TODO: refactor to component
            category.children_fks = category.children_fks || category.children.map((child) => { return child.id; }) || [];
            if (category.children_fks.length === 0) {
                return;
            }
            this.get('repository').findById(category.id);
        },
        selected_category(category) {
            if (category.get('children_fks').length === 0) {
                return;
            }
            this.get('repository').findById(category.get('id'));
        }
    }
});

export default ParentTicketCategorySelect;
