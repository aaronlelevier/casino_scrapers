import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import StrictMixin from 'bsrs-ember/mixins/validation/strict';

var TicketNewComponent = ParentValidationComponent.extend(StrictMixin, TabMixin, NewTabMixin, {
  personRepo: inject('person'),
  locationRepo: inject('location'),
  child_components: ['parent-model-category-select'],
  repository: inject('ticket'),
  requesterValidation: validate('model.requester'),
  statusValidation: validate('model.status'),
  priorityValidation: validate('model.priority'),
  assigneeValidation: validate('model.assignee'),
  locationValidation: validate('model.location'),
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
      if (this.all_components_valid()) {
        const model = this.get('model');
        const tab = this.tab();
        return this.get('save')(model, this.get('repository'), tab);
      }
    }
  }
});

export default TicketNewComponent;
