import Ember from 'ember';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import BaseComponent from 'bsrs-ember/components/base-component/component';

var TicketSingleComponent = BaseComponent.extend(ValidationMixin, {
    // numberValidation: validate('model.number'),
    // subjectValidation: validate('model.subject'),
    // priorityValidation: validate('model.priority'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        }
    } 
});

export default TicketSingleComponent;

