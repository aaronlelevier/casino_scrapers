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

var store, original_xhr, subject, run = Ember.run, person_location, person_location_two, locationzz, location_two, person, role, role_category, category, category_two, ticket_category, ticket_category_two, ticket, ticket_two;

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
        run(() => {
            // Location
            person_location = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
            person_location_two = store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idTwo, location_pk: LD.idTwo});
            locationzz= store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: [PERSON_LD.idOne], tickets: [TD.idOne]});
            location_two = store.push('location', {id: LD.idTwo, person_location_fks: [PERSON_LD.idTwo], tickets: [TD.idTwo]});
            person = store.push('person', {id: PD.idOne});
            store.push('person', {id: PD.idTwo});
            // Category
            role = store.push('role', {id: RD.idOne, people: [PD.idOne], role_category_fks: [ROLE_CD.idOne]});
            store.push('role', {id: RD.idTwo});
            role_category = store.push('role-category', {id: ROLE_CD.idOne, role_fk: RD.idOne, category_fk: CD.idOne});
            category = store.push('category', {id: CD.idOne});
            category_two = store.push('category', {id: CD.idTwo});
            ticket_category = store.push('ticket-category', {id: TCD.idOne, ticket_pk: TD.idOne, category_pk: CD.idOne});
            ticket_category_two = store.push('ticket-category', {id: TCD.idTwo, ticket_pk: TD.idTwo, category_pk: CD.idTwo});
            // Ticket
            ticket = store.push('ticket', {id: TD.idOne, ticket_categories_fks: [TCD.idOne]});
            ticket_two = store.push('ticket', {id: TD.idTwo, ticket_categories_fks: [TCD.idTwo]});
        });
    },
    afterEach() {
        PromiseMixin.xhr = original_xhr;
    }
});

test('DEFAULT_LOCATION', (assert) => {
    assert.equal(config.DEFAULT_LOCATION, 'Company');
});

test('findFiltered - by Location and Category', (assert) => {
    let locations = person.get('locations');
    assert.equal(person.get('locations').get('length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('id'), locationzz.get('id'));
    assert.equal(person.get('role').get('categories').get('length'), 1);
    assert.equal(person.get('role').get('categories').objectAt(0).get('id'), category.get('id'));
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 2);
    assert.equal(tickets.objectAt(0).get('id'), ticket.get('id'));
    assert.equal(tickets.objectAt(0).get('location').get('id'), locationzz.get('id'));
    assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('id'), category.get('id'));
    // filter test
    let ticket_array_proxy = subject.findFiltered(person);
    assert.equal(ticket_array_proxy.get('length'), 1);
    assert.equal(ticket_array_proxy.objectAt(0).get('id'), ticket.get('id'));
});

test('findFiltered returns multiple tickets', (assert) => {
    let locations = person.get('locations');
    assert.equal(person.get('locations').get('length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('id'), locationzz.get('id'));
    ticket_category_two = store.push('ticket-category', {id: TCD.idTwo, ticket_pk: TD.idTwo, category_pk: CD.idOne});
    assert.equal(person.get('role').get('categories').get('length'), 1);
    assert.equal(person.get('role').get('categories').objectAt(0).get('id'), category.get('id'));
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 2);
    assert.equal(tickets.objectAt(0).get('id'), ticket.get('id'));
    assert.equal(tickets.objectAt(0).get('location').get('id'), locationzz.get('id'));
    assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('id'), category.get('id'));
    // filter test
    let ticket_array_proxy = subject.findFiltered(person);
    assert.equal(ticket_array_proxy.get('length'), 2);
    assert.equal(ticket_array_proxy.objectAt(0).get('id'), ticket.get('id'));
    assert.equal(ticket_array_proxy.objectAt(1).get('id'), ticket_two.get('id'));
});

test('findFiltered returns false', (assert) => {
    assert.equal(person.get('locations').get('length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('id'), locationzz.get('id'));
    let role_category = store.push('role-category', {id: ROLE_CD.idOne, role_fk: RD.idOne, category_fk: CD.idTwo});
    let category_three = store.push('category', {id: CD.idThree});
    let ticket_category_two = store.push('ticket-category', {id: TCD.idTwo, ticket_pk: TD.idTwo, category_pk: CD.idThree});
    assert.equal(person.get('role').get('categories').get('length'), 1);
    assert.equal(person.get('role').get('categories').objectAt(0).get('id'), category_two.get('id'));
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 2);
    assert.equal(tickets.objectAt(0).get('id'), ticket.get('id'));
    assert.equal(tickets.objectAt(0).get('location').get('id'), locationzz.get('id'));
    assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('id'), category.get('id'));
    // filter test
    let ticket_array_proxy = subject.findFiltered(person);
    assert.equal(ticket_array_proxy.get('length'), 0);
});

test('if person has no locations, they cant see any tickets', (assert) => {
    person_location = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idTwo, location_pk: LD.idOne});
    assert.equal(person.get('locations').get('length'), 0);
    // filter test
    let ticket_array_proxy = subject.findFiltered(person);
    assert.equal(ticket_array_proxy.get('length'), 0);
});

test('if person has no category, they cant see any tickets', (assert) => {
    store.push('role-category', {id: ROLE_CD.idOne, role_fk: RD.idTwo, category_fk: CD.idOne});
    assert.equal(person.get('role').get('categories').get('length'), 0);
    // filter test
    let ticket_array_proxy = subject.findFiltered(person);
    assert.equal(ticket_array_proxy.get('length'), 0);
});

test('person has top level location but ticket does not have that location, person should see all tickets', (assert) => {
    store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne], tickets: []});
    assert.equal(ticket.get('location'), undefined);
    assert.equal(ticket_two.get('location.id'), LD.idTwo);
    assert.equal(person.get('locations').get('length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('id'), LD.idOne);
    assert.equal(person.get('locations').objectAt(0).get('name'), LD.storeName);
    // filter test
    let ticket_array_proxy = subject.findFiltered(person);
    assert.equal(ticket_array_proxy.get('length'), 1);
});

test('findFiltered filters out tickets based on persons locations where person does not have top level location', (assert) => {
    store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idTwo});
    store.push('role-category', {id: ROLE_CD.idOne, role_fk: RD.idOne, category_fk: CD.idTwo});
    assert.equal(ticket.get('location.id'), LD.idOne);
    assert.equal(ticket_two.get('location.id'), LD.idTwo);
    assert.equal(person.get('locations').get('length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('id'), LD.idTwo);
    // filter test
    let ticket_array_proxy = subject.findFiltered(person);
    assert.equal(ticket_array_proxy.get('length'), 1);
    assert.equal(ticket_array_proxy.objectAt(0).get('id'), TD.idTwo);
});
