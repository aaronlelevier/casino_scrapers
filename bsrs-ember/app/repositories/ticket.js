import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import injectUUID from 'bsrs-ember/utilities/uuid';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var TICKET_URL = PREFIX + '/tickets/';

var TicketRepo = Ember.Object.extend(GridRepositoryMixin, {
    uuid: injectUUID('uuid'),
    type: Ember.computed(function() { return 'ticket'; }),
    typeGrid: Ember.computed(function() { return 'ticket-list'; }),
    ancillary_processing: Ember.computed(function() { return ['ticket-list', 'person-list', 'ticket-priority-list', 'ticket-status-list']; }),
    url: Ember.computed(function() { return TICKET_URL; }),
    TicketDeserializer: inject('ticket'),
    deserializer: Ember.computed.alias('TicketDeserializer'),
    update(model) {
        return PromiseMixin.xhr(TICKET_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    // find() {
    //     PromiseMixin.xhr(TICKET_URL, 'GET').then((response) => {
    //         this.get('TicketDeserializer').deserialize(response);
    //     });
    //     return this.get('store').find('ticket-list');
    // },
    findById(id) {
        // let model = this.get('store').find('ticket', id);
        // //return id right away to allow for tabs to be pushed into store with correct id 
        // model.id = id;
        return PromiseMixin.xhr(TICKET_URL + id + '/', 'GET').then((response) => {
            const ticket = this.get('TicketDeserializer').deserialize(response, id);
            return ticket;
        });
        // return model;
    },
    fetch(id) {
        let store = this.get('store');
        return store.find('ticket', id);
    },
});

export default TicketRepo;
