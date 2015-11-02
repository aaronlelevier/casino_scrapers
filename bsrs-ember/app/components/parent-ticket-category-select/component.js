import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import ChildValidationComponent from 'bsrs-ember/mixins/validation/child';

var ParentTicketCategorySelect = ChildValidationComponent.extend({
    repository: inject('category'),
    construct_category_tree(ticket, category, child_nodes=[]) {
        child_nodes.push(category);
        let children = category ? category.get('children') : [];
        if(children.get('length') === 0) {
            return;
        }
        let children_ids = children.mapBy('id');
        let index = ticket.get('categories_ids').reduce(function(found, category_pk) {
            return found > -1 ? found : Ember.$.inArray(category_pk, children_ids);
        }, -1);
        let child = children.objectAt(index);
        this.construct_category_tree(ticket, child, child_nodes);
        return child_nodes.filter(function(node) {
            return node !== undefined;
        });
    },
    valid: Ember.computed('ticket.categories.[]', function() {
        let ticket = this.get('ticket');
        if(ticket.get('categories').get('length') < 1) {
            return false;
        }
        let parent = ticket.get('top_level_category');
        let tree = this.construct_category_tree(ticket, parent);
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
