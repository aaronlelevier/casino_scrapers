import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import injectUUID from 'bsrs-ember/utilities/uuid';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';

var PREFIX = config.APP.NAMESPACE;
var TICKET_URL = PREFIX + '/tickets/';

var TicketRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  uuid: injectUUID('uuid'),
  type: Ember.computed(function() { return 'ticket'; }),
  typeGrid: Ember.computed(function() { return 'ticket-list'; }),
  //TODO: test count to ensure being deleted
  garbage_collection: Ember.computed(function() { return ['ticket-list', 'location-list', 'person-list', 'ticket-priority-list', 'general-status-list', 'category-list']; }),
  url: Ember.computed(function() { return TICKET_URL; }),
  TicketDeserializer: inject('ticket'),
  deserializer: Ember.computed.alias('TicketDeserializer'),
  update(model) {
    return PromiseMixin.xhr(TICKET_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
      model.save();
      model.saveRelated();
    });
  },
  patch(model, link) {
    const destination_id = link.get('destination.id');
    return PromiseMixin.xhr(`${TICKET_URL}${destination_id}/dt/`, 'PATCH', {data: JSON.stringify(model.patchSerialize(link))}).then((response) => {
      model.save();
      model.saveRelated();
      return response;
    });
  },
  dtPost(model, destination_id) {
    return PromiseMixin.xhr(`${TICKET_URL}${destination_id}/dt/`, 'POST', {data: JSON.stringify(model.serialize())}).then((response) => {
      model.save();
      model.saveRelated();
      return response;
    });
  },
});

export default TicketRepo;
