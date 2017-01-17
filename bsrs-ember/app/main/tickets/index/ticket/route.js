import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

let TicketSingleRoute = TabRoute.extend(FindById, {
  i18n: Ember.inject.service(),
  title() {
    return this.get('i18n').t('doctitle.ticket.single', { number: this.get('ticketNumber') });
  },
  ticketNumber: undefined,
  activityRepository: inject('activity'),
  repository: inject('ticket'),
  workOrderRepository: inject('work-order'),
  attachmentRepository: inject('attachment'),
  deviceLayout: Ember.inject.service('device/layout'),
  /** 
   * @method transitionCB
   * removes attachments from local store and find newly attached files and sends out batch delete 
   */ 
  transitionCB(model) {
    const remove_attachment_ids = model.get('remove_attachment_ids');
    this.get('attachmentRepository').removeAllUnrelated(remove_attachment_ids);
  },
  redirectRoute: 'main.tickets.index',
  module: 'ticket',
  templateModelField: 'categories',
  model(params) {
    const pk = params.ticket_id;
    const repository = this.get('repository');
    let ticket = repository.fetch(pk);
    const otherXhrs = [this.get('activityRepository').find('ticket', 'tickets', pk, ticket)];
    return this.findByIdScenario(ticket, pk, { repository: repository }, false, otherXhrs);
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
    if (hash.otherXhrs) {
      controller.set('activities', hash.otherXhrs[0]);
    }

    /* MOBILE SPECIFIC */
    if (this.get('deviceLayout').isMobile) {
      const hashComponents = [
        {'title': this.get('i18n').t('ticket.section.activity'), 'component': 'mobile/ticket/activity-section', active: 'active'},
        {'title': this.get('i18n').t('ticket.section.details'), 'component': 'mobile/ticket/detail-section', active: ''},
        {'title': this.get('i18n').t('ticket.section.location'), 'component': 'mobile/ticket/location-section', active: ''},
      ];
      controller.set('hashComponents', hashComponents);
    }

    // set doctitle
    this.set('ticketNumber', hash.model.get('number'));
  },
  actions: {
    findWorkOrderCategory() {
      const ticket = this.modelFor(this.routeName).model;
      const leaf_category = ticket.get('leaf_category');
      return this.get('workOrderRepository').findWorkOrderCategory(leaf_category.get('id'));
    },
    /**
     * should set tickets leaf category as the category for the work order
     * @method createWorkOrder
     */
    createWorkOrder() {
      const ticket = this.modelFor(this.routeName).model;
      const leaf_category = ticket.get('leaf_category');
      return this.get('workOrderRepository').createWorkOrder(leaf_category.get('id'), ticket.get('id'));
    },
    /**
     * will pause until work order is created before showing ticket single
     * @method saveWorkOrder
     */
    saveWorkOrder(wo) {
      return this.get('workOrderRepository').update(wo);
    },
    /**
     * @method ticketApplicationNotice
     * @param {Object} xhr
     * @param {Object} model
     */
    ticketApplicationNotice(xhr, wo) {
      this.send('sendHandleApplicationNotice', xhr, wo);
    },
    /**
     * @method dispatchWorkOrder
     */
    dispatchWorkOrder(work_order) {
      return this.get('workOrderRepository').dispatchWorkOrder(work_order);
    },
  }
});

export default TicketSingleRoute;
