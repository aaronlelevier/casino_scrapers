import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var TicketNewComponent = Ember.Component.extend(TabMixin, NewTabMixin, ValidationMixin, {
    repository: inject('ticket'),
    statusValidation: validate('model.status'),
    priorityValidation: validate('model.priority'),
    assigneeValidation: validate('model.assignee'),
    locationValidation: validate('model.location'),
    actions: {
        changed_status: function(new_status_id) {
            let ticket = this.get('model');
            ticket.change_status(new_status_id);
        },
        changed_priority: function(new_priority_id) {
            let ticket = this.get('model');
            ticket.change_priority(new_priority_id);
        },
        saveNew: function() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        }
    }
});

export default TicketNewComponent;
