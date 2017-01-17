import Ember from 'ember';
const { get, set } = Ember;
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task, all } from 'ember-concurrency';

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
  /**
   * 1. Iterator over work orders and save each one, waiting to save the ticket after all have finished
   * 2. Save ticket only if ticket is dirty after cleaning work orders
   * @method saveTask
   */
  saveTask: task(function * (update, updateActivities) {

    let childTasks = [];
    const work_orders = this.get('model').get('wo');

    for (let indx = 0; indx < work_orders.get('length'); ++indx) {
      const wo = work_orders.objectAt(indx);
      // TODO: test validations
      if (wo.get('isDirtyOrRelatedDirty') && wo.get('validations.isValid')) {
        childTasks.push(this.get('saveWorkOrderTask').perform(wo));
      }
    }

    try {
      yield all(childTasks);
    } catch(xhr) {
      // We dont know which work order put xhr failed
      this.get('ticketApplicationNotice')(xhr, {});
      return;
    }

    if (this.get('model.isDirtyOrRelatedDirty') && this.get('model.validations.isValid')) {
      const tab = this.tab();
      const activities = yield this.get('save')(tab, this.get('activityRepository'), update, updateActivities);

      if (activities && updateActivities) {
        this.set('activities', activities);
      }
    }

  }),
  saveWorkOrderTask: task(function * (wo) {
    yield this.get('saveWorkOrder')(wo);
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
    },
    deleteAttachment(tab, callback) {
      this.sendAction('deleteAttachment', tab, callback);
    },
    /**
     * create local work order w/ ticket leaf category
     * set dispatchWorkOrderSteps to enable modal
     * @method createWorkOrder
     */
    openWorkOrderModal() {
      const model = get(this, 'model');
      set(this, 'dispatchWorkOrderSteps', true);
      const workOrderModel = get(this, 'createWorkOrder')(model.get('leaf_category'));
      set(this, 'workOrderModel', workOrderModel);
    },
    /**
     * close modal
     * @method cancelWorkOrder
     */
    cancelWorkOrder() {
      set(this, 'dispatchWorkOrderSteps', false);
    },
  }
});

export default TicketSingleComponent;
