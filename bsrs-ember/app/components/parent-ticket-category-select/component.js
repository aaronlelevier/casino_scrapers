import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var ParentTicketCategorySelectComponent = Ember.Component.extend({
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
        selected_category(category_pk) {
            this.get('repository').findById(category_pk);
        }
    }
});

export default ParentTicketCategorySelectComponent;
