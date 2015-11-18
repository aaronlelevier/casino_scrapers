import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import RelaxedMixin from 'bsrs-ember/mixins/validation/relaxed';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';

var TicketSingleComponent = ParentValidationComponent.extend(RelaxedMixin, TabMixin, EditMixin, {
    child_components: ['parent-ticket-category-select'],
    repository: inject('ticket'),
    attachmentRepository: inject('attachment'),
    numberValidation: validate('model.number'),
    assigneeValidation: validate('model.assignee'),
    priorityValidation: validate('model.priority'),
    locationValidation: validate('model.location'),
    statusValidation: validate('model.status'),
    files: function(e) {
        return e.target.files;
    },
    actions: {
        upload(e) {
            let files = this.files(e);
            let ticket = this.get('model');
            let uploader = this.get('attachmentRepository');
            if (files && files[0]) {
                uploader.upload(files[0], ticket.get('id')).then((file) => {
                    ticket.get('files').filterBy('id', file.id).objectAt(0).set('uploaded', true);
                });
            }
        },
        save() {
            this.set('submitted', true);
            if (this.all_components_valid()) {
                this._super();
            }
        }
    } 
});

export default TicketSingleComponent;

