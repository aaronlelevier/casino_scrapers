import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import RelaxedMixin from 'bsrs-ember/mixins/validation/relaxed';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import { task } from 'ember-concurrency';

var TicketSingleComponent = ParentValidationComponent.extend(RelaxedMixin, TabMixin, {
  didValidate: false,
  personRepo: inject('person'),
  locationRepo: inject('location'),
  child_components: ['parent-model-category-select'],
  repository: inject('ticket'),
  activityRepository: inject('activity'),
  classNameBindings: ['mobile:mobile-meta-data'],
  continueDTId: Ember.computed(function() {
    const ticket = this.get('model');
    const last_dt = ticket.get('dt_path').slice(-1);
    return last_dt[0]['dtd']['id'];
  }),
  saveTask: task(function * (update, updateActivities) {
    this.set('submitted', true);
    if (this.all_components_valid()) {
      if (this.get('model.validations.isValid')) {
        const tab = this.tab();
        const activities = yield this.get('save')(tab, this.get('activityRepository'), update, updateActivities);
        if (activities && updateActivities) {
          this.set('activities', activities);
        }
      }
      this.set('didValidate', true);
    }
  }),
  actions: {
    /* @method save
     * @param {bool} update - general boolean to no close tab
     * @param {bool} updateActivities - specifically to fetch activities for detail view to return and set in respective single component
     */
    save(update, updateActivities) {
      this.get('saveTask').perform(update, updateActivities);
    },
    deleteAttachment(tab, callback) {
      this.sendAction('deleteAttachment', tab, callback);
    }
  }
});

export default TicketSingleComponent;
