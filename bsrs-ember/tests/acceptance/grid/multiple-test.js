import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PF from 'bsrs-ember/vendor/people_fixtures';
import CF from 'bsrs-ember/vendor/category_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_TICKET_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_TICKET_URL}/index`;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const PEOPLE_URL = `${BASE_PEOPLE_URL}/index`;
const BASE_CATEGORY_URL = BASEURLS.base_categories_url;
const CATEGORY_URL = `${BASE_CATEGORY_URL}/index`;
// const BACKSPACE = {keyCode: 8};
// const SORT_PRIORITY_DIR = '.t-sort-priority-translated-name-dir';
// const SORT_STATUS_DIR = '.t-sort-status-translated-name-dir';
// const SORT_LOCATION_DIR = '.t-sort-location-name-dir';
// const SORT_ASSIGNEE_DIR = '.t-sort-assignee-fullname-dir';
// const FILTER_PRIORITY = '.t-filter-priority-translated-name';

var application, store, ticket_endpoint, ticket_list_xhr, people_endpoint, people_list_xhr, category_endpoint, category_list_xhr, original_uuid;

module('Acceptance | multiple grid test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        ticket_endpoint = `${PREFIX}${BASE_TICKET_URL}/?page=1`;
        ticket_list_xhr = xhr(ticket_endpoint, 'GET', null, {}, 200, TF.list());
        people_endpoint = `${PREFIX}${BASE_PEOPLE_URL}/?page=1`;
        people_list_xhr = xhr(people_endpoint, 'GET', null, {}, 200, PF.list());
        original_uuid = random.uuid;
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('navigating between ticket and people and locations and category will not dirty models and will clear m2m models (categories only)', function(assert) {
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-title').text(), 'Tickets');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-priority-translated_name').text().trim(), TD.priorityOne);
        const tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 10);
        tickets.forEach((ticket) => {
            assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        });
        const ticket_cats = store.find('ticket-category');
        assert.equal(ticket_cats.get('length'), 30);
        const categorys = store.find('category');
        assert.equal(categorys.get('length'), 3);
        categorys.forEach((category) => {
            assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 2);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
        const locations = store.find('location');
        assert.equal(locations.get('length'), 1);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    var page_two = `${PREFIX}${BASE_TICKET_URL}/?page=2`;
    xhr(page_two,"GET",null,{},200,TF.list_two());
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), `${TICKET_URL}?page=2`);
        assert.equal(find('.t-grid-title').text(), 'Tickets');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        const tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 9);
        tickets.forEach((ticket) => {
            assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        });
        const ticket_cats = store.find('ticket-category');
        assert.equal(ticket_cats.get('length'), 9);
        const categorys = store.find('category');
        assert.equal(categorys.get('length'), 3);
        categorys.forEach((category) => {
            assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 3);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
        const locations = store.find('location');
        assert.equal(locations.get('length'), 2);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(find('.t-grid-title').text(), 'People');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        const tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 9);
        tickets.forEach((ticket) => {
            assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        });
        const ticket_cats = store.find('ticket-category');
        assert.equal(ticket_cats.get('length'), 9);
        const categorys = store.find('category');
        assert.equal(categorys.get('length'), 3);
        categorys.forEach((category) => {
            assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 12);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
        const locations = store.find('location');
        assert.equal(locations.get('length'), 2);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    var page_two_people = `${PREFIX}${BASE_PEOPLE_URL}/?page=2`;
    xhr(page_two_people,"GET",null,{},200,PF.list_two());
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
        const tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 9);
        tickets.forEach((ticket) => {
            assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        });
        const ticket_cats = store.find('ticket-category');
        assert.equal(ticket_cats.get('length'), 9);
        const categorys = store.find('category');
        assert.equal(categorys.get('length'), 3);
        categorys.forEach((category) => {
            assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 10);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
        const locations = store.find('location');
        assert.equal(locations.get('length'), 2);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    category_endpoint = `${PREFIX}${BASE_CATEGORY_URL}/?page=1`;
    category_list_xhr = xhr(category_endpoint, 'GET', null, {}, 200, CF.list());
    visit(CATEGORY_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL);
        assert.equal(find('.t-grid-title').text(), 'Categories');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        const tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 9);
        tickets.forEach((ticket) => {
            assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        });
        const ticket_cats = store.find('ticket-category');
        assert.equal(ticket_cats.get('length'), 9);
        const categorys = store.find('category');
        assert.equal(categorys.get('length'), 13);
        categorys.forEach((category) => {
            assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 10);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
        const locations = store.find('location');
        assert.equal(locations.get('length'), 2);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    var page_two_cat = `${PREFIX}${BASE_CATEGORY_URL}/?page=2`;
    xhr(page_two_cat,"GET",null,{},200,CF.list_two());
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        const tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 9);
        tickets.forEach((ticket) => {
            assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        });
        const ticket_cats = store.find('ticket-category');
        assert.equal(ticket_cats.get('length'), 9);
        const categorys = store.find('category');
        assert.equal(categorys.get('length'), 12);
        categorys.forEach((category) => {
            assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 10);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
        const locations = store.find('location');
        assert.equal(locations.get('length'), 2);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
});

test('navigating between ticket and people will not dirty models and will clear ticket from ticket-status and ticket-priority', function(assert) {
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        const tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 10);
        tickets.forEach((ticket) => {
            assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        });
        const ticket_priorities = store.find('ticket-priority');
        assert.equal(ticket_priorities.get('length'), 4);
        const ticket_statuses = store.find('ticket-status');
        assert.equal(ticket_statuses.get('length'), 8);
        assert.equal(ticket_statuses.objectAt(0).get('tickets').get('length'), 10);
        assert.equal(ticket_priorities.objectAt(0).get('tickets').get('length'), 10);
        const persons = store.find('person');
        assert.equal(persons.get('length'), 2);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
        const locations = store.find('location');
        assert.equal(locations.get('length'), 1);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    var page_two = `${PREFIX}${BASE_TICKET_URL}/?page=2`;
    xhr(page_two,"GET",null,{},200,TF.list_two());
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), `${TICKET_URL}?page=2`);
        assert.equal(find('.t-grid-title').text(), 'Tickets');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        const tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 9);
        tickets.forEach((ticket) => {
            assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        });
        const ticket_priorities = store.find('ticket-priority');
        assert.equal(ticket_priorities.get('length'), 4);
        const ticket_statuses = store.find('ticket-status');
        assert.equal(ticket_statuses.get('length'), 8);
        assert.equal(ticket_statuses.objectAt(0).get('tickets').get('length'), 1);
        assert.equal(ticket_priorities.objectAt(0).get('tickets').get('length'), 1);
        assert.equal(ticket_statuses.objectAt(1).get('tickets').get('length'), 9);
        assert.equal(ticket_priorities.objectAt(1).get('tickets').get('length'), 9);
        const persons = store.find('person');
        assert.equal(persons.get('length'), 3);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
        const locations = store.find('location');
        assert.equal(locations.get('length'), 2);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(find('.t-grid-title').text(), 'People');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        const tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 9);
        tickets.forEach((ticket) => {
            assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        });
        const ticket_priorities = store.find('ticket-priority');
        assert.equal(ticket_priorities.get('length'), 4);
        const ticket_statuses = store.find('ticket-status');
        assert.equal(ticket_statuses.get('length'), 8);
        assert.equal(ticket_statuses.objectAt(0).get('tickets').get('length'), 1);
        assert.equal(ticket_priorities.objectAt(0).get('tickets').get('length'), 1);
        assert.equal(ticket_statuses.objectAt(1).get('tickets').get('length'), 9);
        assert.equal(ticket_priorities.objectAt(1).get('tickets').get('length'), 9);
        const persons = store.find('person');
        assert.equal(persons.get('length'), 12);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
        const locations = store.find('location');
        assert.equal(locations.get('length'), 2);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
});
