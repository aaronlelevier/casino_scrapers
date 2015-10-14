import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewMixin from 'bsrs-ember/mixins/components/tab/new';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var TicketNewComponent = Ember.Component.extend(TabMixin, NewMixin, ValidationMixin, {
    repository: inject('ticket'),
    statusValidation: validate('model.status'),
    actions: {
        changed: function(new_status_id) {
            let ticket = this.get('model');
            ticket.change_status(new_status_id);
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
