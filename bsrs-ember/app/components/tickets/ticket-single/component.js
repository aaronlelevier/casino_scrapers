import Ember from 'ember';
const { get, set } = Ember;
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

let TicketSingleComponent = Ember.Component.extend(TabMixin, {
  dispatchWorkOrderSteps: false,
  workOrderModel: null,
  // override mixin
  tagName: 'div',
  personRepo: inject('person'),
  locationRepo: inject('location'),
  activityRepository: inject('activity'),
  classNameBindings: ['mobile:mobile-meta-data'],
  continueDT: Ember.computed(function() {
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
  saveWorkOrderTask: task(function * (wo) {
    if (wo.get('validations.isValid')) {
      yield this.get('saveWorkOrder')(wo);
    }
  }),
  actions: {
    /**
     * Delegate save for Ticket and each Work Order (only if work order is dirty)
     * @method save
     * @param {bool} update - general boolean to no close tab
     * @param {bool} updateActivities - specifically to fetch activities for detail view to return and set in respective single component
     */
    save(update, updateActivities) {
      this.get('saveTask').perform(update, updateActivities);

      const work_orders = this.get('model').get('wo');
      work_orders.forEach((wo) => {
        if (wo.get('isDirtyOrRelatedDirty')) {
          this.get('saveWorkOrderTask').perform(wo);
        }
      });
    },
    deleteAttachment(tab, callback) {
      this.sendAction('deleteAttachment', tab, callback);
    },
    /**
     * create local work order w/ ticket leaf category
     * set dispatchWorkOrderSteps to enable modal
     * @method createWorkOrder
     */
    createWorkOrder() {
      const model = get(this, 'model');
      set(this, 'dispatchWorkOrderSteps', true);
      const workOrderModel = get(this, 'createWorkOrder')(model.get('leaf_category'));
      set(this, 'workOrderModel', workOrderModel);
    },
    cancelWorkOrder() {
      set(this, 'dispatchWorkOrderSteps', false);
    },
  }
});

export default TicketSingleComponent;
