import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';
import { validate } from 'ember-cli-simple-validation/mixins/validate';

var TicketNewComponent = Ember.Component.extend(TabMixin, NewTabMixin, {
    repository: inject('ticket'),
    statusValidation: validate('model.status'),
    priorityValidation: validate('model.priority'),
    assigneeValidation: validate('model.assignee'),
    locationValidation: validate('model.location'),
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
    valid: Ember.computed('model.categories.[]', function() {
        let ticket = this.get('model');
        if(ticket.get('categories').get('length') < 1) {
            return false;
        }
        let parent = ticket.get('top_level_category');
        let tree = this.construct_category_tree(ticket, parent);
        return tree ? !tree.pop().get('has_children') : true;
    }),
    actions: {
        changed_status: function(new_status_id) {
            const ticket = this.get('model');
            ticket.change_status(new_status_id);
        },
        changed_priority: function(new_priority_id) {
            const ticket = this.get('model');
            ticket.change_priority(new_priority_id);
        },
        save: function() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        }
    }
});

export default TicketNewComponent;
