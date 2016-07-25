import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import injectUUID from 'bsrs-ember/utilities/uuid';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import { TICKETS_URL } from 'bsrs-ember/utilities/urls';

var PREFIX = config.APP.NAMESPACE;
var TICKET_URL = '/ticket';

var TicketRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  uuid: injectUUID('uuid'),
  type: 'ticket',
  typeGrid: 'ticket-list',
  //TODO: test count to ensure being deleted
  garbage_collection: ['ticket-list', 'ticket-priority-list', 'general-status-list', 'category-list'],
  url: TICKETS_URL,
  TicketDeserializer: inject('ticket'),
  deserializer: Ember.computed.alias('TicketDeserializer'),
  create(new_pk, options={}) {
    let ticket;
    let store = this.get('simpleStore');
    const pk = this.get('uuid').v4();
    let status_id = store.find('ticket-status', {default: true}).objectAt(0).get('id');
    let priority_id = store.find('ticket-priority', {default: true}).objectAt(0).get('id');
    /* jshint ignore:start */
    ticket = this.get('simpleStore').push(this.get('type'), {id: pk, new: true, new_pk: new_pk, status_fk: status_id, priority_fk: priority_id, ...options});
    /* jshint ignore:end */
    ticket.change_status(status_id);
    ticket.change_priority(priority_id);
    return ticket;
  },
  patch(ticket, link, patch_id) {
    return PromiseMixin.xhr(`${PREFIX}/dt/${patch_id}${TICKET_URL}/`, 'PATCH', {data: JSON.stringify(ticket.patchSerialize(link))}).then((response) => {
      ticket.save();
      ticket.saveRelated();
      return response;
    });
  },
  submit(ticket, link) {
    return PromiseMixin.xhr(`${PREFIX}/dt/submit/`, 'PATCH', {data: JSON.stringify(ticket.patchSerialize(link))}).then((response) => {
      ticket.save();
      ticket.saveRelated();
      return response;
    });
  },
  dtPost(model, link) {
    const post_id = link.get('destination').get('id');
    return PromiseMixin.xhr(`${PREFIX}/dt/${post_id}${TICKET_URL}/`, 'POST', {data: JSON.stringify(model.serialize())}).then((response) => {
      model.save();
      model.saveRelated();
      return response;
    });
  },
  findTicketDrafts(){
    /* Not store bound b/c no interaction with data */
    return PromiseMixin.xhr(`${TICKETS_URL}?status__name=ticket.status.draft`, 'GET').then(response => response.results);
  }
});

export default TicketRepo;
