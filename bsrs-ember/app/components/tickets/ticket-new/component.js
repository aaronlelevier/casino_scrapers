import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';

var TicketNewComponent = ParentValidationComponent.extend(TabMixin, NewTabMixin, {
    child_components: ['parent-ticket-category-select'],
    repository: inject('ticket'),
    statusValidation: validate('model.status'),
    priorityValidation: validate('model.priority'),
    assigneeValidation: validate('model.assignee'),
    locationValidation: validate('model.location'),
    all_child_components_valid() {
        let value = true;
        Object.keys(this.child_validators).forEach((key) => {
            value = this.child_validators[key] && value;
        });
        const legit = this.get('valid') && value === true;
        const children = this.get('child_components').get('length');
        const verified = Object.keys(this.child_validators).length;
        return legit && children === verified;
    },
    actions: {
        changed_status(new_status_id) {
            const ticket = this.get('model');
            ticket.change_status(new_status_id);
        },
        changed_priority(new_priority_id) {
            const ticket = this.get('model');
            ticket.change_priority(new_priority_id);
        },
        save() {
            this.set('submitted', true);
            if (this.all_child_components_valid()) {
                this._super();
            }
        }
    }
});

export default TicketNewComponent;
