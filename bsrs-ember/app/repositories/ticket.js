import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var TICKET_URL = PREFIX + '/tickets/';

var TicketRepo = Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'ticket'; }),
    url: Ember.computed(function() { return TICKET_URL; }),
    TicketDeserializer: inject('ticket'),
    deserializer: Ember.computed.alias('TicketDeserializer'),
    insert(model) {
        return PromiseMixin.xhr(TICKET_URL, 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });
    },
    update(model) {
        return PromiseMixin.xhr(TICKET_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });   
    },
    findticketChildren(search) {
        let url = TICKET_URL;
        search = search ? search.trim() : search;
        if (search) {
            url += `?name__icontains=${search}`;
            PromiseMixin.xhr(url, 'GET').then((response) => {
                this.get('TicketDeserializer').deserialize(response);
            });
            return this.get('store').find('ticket');
        }
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
    delete(id) {
       PromiseMixin.xhr(TICKET_URL + id + '/', 'DELETE');
       this.get('store').remove('ticket', id);
    },
});

export default TicketRepo;
