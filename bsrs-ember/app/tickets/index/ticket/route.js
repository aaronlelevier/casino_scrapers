import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var TicketSingleRoute = TabRoute.extend(FindById, {
  i18n: Ember.inject.service(),
  title() {
    return this.get('i18n').t('doctitle.ticket.single');
  },
  activityRepository: inject('activity'),
  repository: inject('ticket'),
  attachmentRepository: inject('attachment'),
  deviceLayout: Ember.inject.service('device/layout'),
  /* @method transitionCB
   * removes attachments from local store and find newly attached files and sends out batch delete 
   */ 
  transitionCB(model) {
    const remove_attachment_ids = model.get('remove_attachment_ids');
    this.get('attachmentRepository').removeAllUnrelated(remove_attachment_ids);
  },
  redirectRoute: 'tickets.index',
  module: 'ticket',
  templateModelField: 'categories',
  model(params) {
    const pk = params.ticket_id;
    const repository = this.get('repository');
    let ticket = repository.fetch(pk);
    const otherXhrs = [this.get('activityRepository').find('ticket', 'tickets', pk, ticket)];


    return this.findByIdScenario(ticket, pk, { repository:repository }, false, otherXhrs);
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
  },
});

export default TicketSingleRoute;
