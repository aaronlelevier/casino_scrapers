import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import StrictMixin from 'bsrs-ember/mixins/validation/strict';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';

var TicketSingleComponent = ParentValidationComponent.extend(StrictMixin, TabMixin, EditMixin, {
    child_components: ['parent-ticket-category-select'],
    repository: inject('ticket'),
    numberValidation: validate('model.number'),
    assigneeValidation: validate('model.assignee'),
    priorityValidation: validate('model.priority'),
    locationValidation: validate('model.location'),
    statusValidation: validate('model.status'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.all_components_valid()) {
                this._super();
            }
        }
    } 
});

export default TicketSingleComponent;

