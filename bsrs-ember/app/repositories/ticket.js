import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import injectUUID from 'bsrs-ember/utilities/uuid';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';

var PREFIX = config.APP.NAMESPACE;
var TICKET_URL = '/ticket';
var TICKETS_URL = PREFIX + '/tickets/';

var TicketRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  uuid: injectUUID('uuid'),
  type: Ember.computed(function() { return 'ticket'; }),
  typeGrid: Ember.computed(function() { return 'ticket-list'; }),
  //TODO: test count to ensure being deleted
  garbage_collection: Ember.computed(function() { return ['ticket-list', 'location-list', 'person-list', 'ticket-priority-list', 'general-status-list', 'category-list']; }),
  url: Ember.computed(function() { return TICKETS_URL; }),
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
  update(model) {
    return PromiseMixin.xhr(TICKETS_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
      model.save();
      model.saveRelated();
    });
  },
  patch(ticket, link) {
    return PromiseMixin.xhr(`${PREFIX}/dt/${link.get('destination.id')}${TICKET_URL}/`, 'PATCH', {data: JSON.stringify(ticket.patchSerialize(link))}).then((response) => {
      ticket.save();
      ticket.saveRelated();
      return response;
    });
  },
  dtPost(model) {
    return PromiseMixin.xhr(`${PREFIX}/dt${TICKET_URL}/`, 'POST', {data: JSON.stringify(model.serialize())}).then((response) => {
      model.save();
      model.saveRelated();
      return response;
    });
  },
  findTicketDrafts(){
    PromiseMixin.xhr(`${TICKETS_URL}?status__name=ticket.status.draft`, 'GET').then((response) => {
      this.get('TicketDeserializer').deserialize(response);
    });
    return this.get('simpleStore').find('ticket-list');
  }
});

export default TicketRepo;
