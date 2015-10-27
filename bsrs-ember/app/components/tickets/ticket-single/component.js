import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var TicketSingleComponent = Ember.Component.extend(TabMixin, EditMixin, ValidationMixin, {
    repository: inject('ticket'),
    numberValidation: validate('model.number'),
    priorityValidation: validate('model.priority'),
    statusValidation: validate('model.status'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        },
        changed: function(new_status_id) {
            let ticket = this.get('model');
            ticket.change_status(new_status_id);
        },
        changed_priority(new_priority_id) {
            let ticket = this.get('model');
            ticket.change_priority(new_priority_id);
        }
    } 
});

export default TicketSingleComponent;

