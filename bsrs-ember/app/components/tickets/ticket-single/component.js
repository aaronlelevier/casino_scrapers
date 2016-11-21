import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

var TicketSingleComponent = Ember.Component.extend(TabMixin, {
  personRepo: inject('person'),
  locationRepo: inject('location'),
  activityRepository: inject('activity'),
  classNameBindings: ['mobile:mobile-meta-data'],
  continueDTId: Ember.computed(function() {
    const ticket = this.get('model');
    const last_dt = ticket.get('dt_path').slice(-1);
    return last_dt[0]['dtd']['id'];
  }),
  saveTask: task(function * (update, updateActivities) {
    if (this.get('model.validations.isValid')) {
      const tab = this.tab();
      const activities = yield this.get('save')(tab, this.get('activityRepository'), update, updateActivities);
      if (activities && updateActivities) {
        this.set('activities', activities);
      }
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
