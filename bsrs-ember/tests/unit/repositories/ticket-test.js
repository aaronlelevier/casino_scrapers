import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TicketRepository from 'bsrs-ember/repositories/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import LD from 'bsrs-ember/vendor/defaults/location';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';

var store, original_xhr, run = Ember.run;

module('unit: ticket repository test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:location', 'model:person-location', 'model:ticket']);
        original_xhr = PromiseMixin.xhr;
        PromiseMixin.xhr = function() {
            return {
                then() {}
            };
        };
    },
    afterEach() {
        PromiseMixin.xhr = original_xhr;
    }
});

test('filter - will only return Tickets where the Ticket.location is in the Person.locations array', (assert) => {
    let m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    let m2m_two = store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idTwo, location_pk: LD.idTwo});
    let location = store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne], tickets: [TD.idOne]});
    let location_two = store.push('location', {id: LD.idTwo, person_location_fks: [PERSON_LD.idTwo], tickets: [TD.idTwo]});
    let person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne]});
    let ticket = store.push('ticket', {id: TD.idOne});
    let ticket_two = store.push('ticket', {id: TD.idTwo});
    let locations = person.get('locations');
    assert.equal(locations.get('length'), 1);
    assert.equal(locations.objectAt(0).get('id'), location.get('id'));
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 2);
    assert.equal(tickets.objectAt(0).get('id'), ticket.get('id'));
    assert.equal(tickets.objectAt(1).get('id'), ticket_two.get('id'));
    assert.equal(tickets.objectAt(0).get('location.id'), LD.idOne);
    assert.equal(tickets.objectAt(1).get('location.id'), LD.idTwo);
    let subject = TicketRepository.create({store: store});
    let ticket_array_proxy = subject.findFiltered(person);
    assert.equal(ticket_array_proxy.get('length'), 1);
});
