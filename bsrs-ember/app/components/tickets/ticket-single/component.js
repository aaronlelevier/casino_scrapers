import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import RelaxedMixin from 'bsrs-ember/mixins/validation/relaxed';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';

var TicketSingleComponent = ParentValidationComponent.extend(RelaxedMixin, TabMixin, EditMixin, {
  didValidate: false,
  personRepo: inject('person'),
  locationRepo: inject('location'),
  child_components: ['parent-model-category-select'],
  repository: inject('ticket'),
  activityRepository: inject('activity'),
  continueDTId: Ember.computed(function() {
    const ticket = this.get('model');
    const last_dt = ticket.get('dt_path').slice(-1);
    return last_dt[0]['dtd']['id'];
  }),
  actions: {
    save(update=false) {
      this.set('submitted', true);
      if (this.all_components_valid()) {
        if (this.get('model.validations.isValid')) {
          const promise = this._super(update);
          if (promise && promise.then) {
            promise.then((activities) => {
              this.set('activities', activities);
            });
          }
        }
        this.set('didValidate', true);
      }
    },
    deleteAttachment(tab, callback) {
      this.sendAction('deleteAttachment', tab, callback);
    }
  }
});

export default TicketSingleComponent;
