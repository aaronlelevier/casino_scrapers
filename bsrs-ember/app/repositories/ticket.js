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
    url: Ember.computed(function() { return TICKET_URL; }),
    TicketDeserializer: inject('ticket'),
    deserializer: Ember.computed.alias('TicketDeserializer'),
    findFiltered(person) {
        //perf issue
        const locations = person.get('locations');
        //perf issue
        const location_names = locations.mapBy('name');
        const role_category_ids = person.get('role').get('categories').mapBy('id');
        const filterFunc = function(ticket) {
            const topLocation = function() {
                //perf issue
                if (Ember.$.inArray(config.DEFAULT_LOCATION, location_names) > -1) {
                    return true;
                }
            };
            const ticketLocation = function(ticket) {
                var location_id = ticket.get('location.id');
                //perf issue
                var location_ids = locations.mapBy('id');
                //perf issue
                return Ember.$.inArray(location_id, location_ids) > -1;
            };
            if (topLocation() || ticketLocation(ticket)) {
                var ticket_category_ids = ticket.get('categories').mapBy('id');
                var result = false;
                if(person.get('locations').get('length') === 0){ 
                    return result; 
                }
                ticket_category_ids.forEach((cid) => {
                    var temp_result = Ember.$.inArray(cid, role_category_ids) > -1;
                    result = result || temp_result;
                });
                return result;
            }
        };
        return this.get('store').find('ticket', filterFunc);
    },
    update(model) {
        return PromiseMixin.xhr(TICKET_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    find() {
        PromiseMixin.xhr(TICKET_URL, 'GET').then((response) => {
            this.get('TicketDeserializer').deserialize(response);
        });
        return this.get('store').find('ticket');
    },
    findById(id) {
        let model = this.get('store').find('ticket', id);
        //return id right away to allow for tabs to be pushed into store with correct id 
        model.id = id;
        PromiseMixin.xhr(TICKET_URL + id + '/', 'GET').then((response) => {
            this.get('TicketDeserializer').deserialize(response, id);
        });
        return model;
    },
    fetch(id) {
        let store = this.get('store');
        return store.find('ticket', id);
    },
    delete(id) {
       PromiseMixin.xhr(TICKET_URL + id + '/', 'DELETE');
       this.get('store').remove('ticket', id);
    },
});

export default TicketRepo;
