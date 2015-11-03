import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';

var TicketSingleComponent = ParentValidationComponent.extend(TabMixin, EditMixin, {
    child_components: ['parent-ticket-category-select'],
    repository: inject('ticket'),
    numberValidation: validate('model.number'),
    assigneeValidation: validate('model.assignee'),
    priorityValidation: validate('model.priority'),
    locationValidation: validate('model.location'),
    statusValidation: validate('model.status'),
    all_child_components_valid: function() {
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
        save() {
            this.set('submitted', true);
            if (this.all_child_components_valid()) {
                this._super();
            }
        }
    } 
});

export default TicketSingleComponent;

