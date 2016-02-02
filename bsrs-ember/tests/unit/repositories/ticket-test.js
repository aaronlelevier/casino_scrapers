import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TicketRepository from 'bsrs-ember/repositories/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import LD from 'bsrs-ember/vendor/defaults/location';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TCD from 'bsrs-ember/vendor/defaults/ticket-category';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';
import RD from 'bsrs-ember/vendor/defaults/role';
import ROLE_CD from 'bsrs-ember/vendor/defaults/role-category';
import CD from 'bsrs-ember/vendor/defaults/category';

var store, original_xhr, subject, run = Ember.run;

module('unit: ticket repository test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:location', 'model:person-location', 'model:category', 'model:role-category', 'model:ticket', 'model:ticket-category']);
        original_xhr = PromiseMixin.xhr;
        subject = TicketRepository.create({store: store});
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

test('DEFAULT_LOCATION_LEVEL', (assert) => {
    assert.equal(config.DEFAULT_LOCATION_LEVEL, 'Company');
});

test('findFiltered - by Location and Category', (assert) => {
    // Location
    let person_location = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    let person_location_two = store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idTwo, location_pk: LD.idTwo});
    let location = store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne], tickets: [TD.idOne]});
    let location_two = store.push('location', {id: LD.idTwo, person_location_fks: [PERSON_LD.idTwo], tickets: [TD.idTwo]});
    let person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne]});
    let locations = person.get('locations');
    assert.equal(person.get('locations').get('length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('id'), location.get('id'));
    // Category
    let role = store.push('role', {id: RD.idOne, people: [PD.idOne], role_category_fks: [ROLE_CD.idOne]});
    let role_category = store.push('role-category', {id: ROLE_CD.idOne, role_fk: RD.idOne, category_fk: CD.idOne});
    let category = store.push('category', {id: CD.idOne});
    let category_two = store.push('category', {id: CD.idTwo});
    let ticket_category = store.push('ticket-category', {id: TCD.idOne, ticket_pk: TD.idOne, category_pk: CD.idOne});
    let ticket_category_two = store.push('ticket-category', {id: TCD.idTwo, ticket_pk: TD.idTwo, category_pk: CD.idTwo});
    assert.equal(person.get('role').get('categories').get('length'), 1);
    assert.equal(person.get('role').get('categories').objectAt(0).get('id'), category.get('id'));
    // Ticket
    let ticket = store.push('ticket', {id: TD.idOne, ticket_categories_fks: [TCD.idOne]});
    let ticket_two = store.push('ticket', {id: TD.idTwo, ticket_categories_fks: [CD.idTwo]});
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 2);
    assert.equal(tickets.objectAt(0).get('id'), ticket.get('id'));
    assert.equal(tickets.objectAt(0).get('location').get('id'), location.get('id'));
    assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('id'), category.get('id'));
    // filter test
    let ticket_array_proxy = subject.findFiltered(person);
    assert.equal(ticket_array_proxy.get('length'), 1);
    assert.equal(ticket_array_proxy.objectAt(0).get('id'), ticket.get('id'));
});
