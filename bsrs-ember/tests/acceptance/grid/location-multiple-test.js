import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PF from 'bsrs-ember/vendor/people_fixtures';
import CF from 'bsrs-ember/vendor/category_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_LOCATION_URL = BASEURLS.base_locations_url;
const LOCATION_URL = `${BASE_LOCATION_URL}/index`;
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

var application, store, location_endpoint, location_list_xhr, ticket_endpoint, ticket_list_xhr, people_endpoint, people_list_xhr, category_endpoint, category_list_xhr, original_uuid;

module('Acceptance | location multiple grid test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        location_endpoint = `${PREFIX}${BASE_LOCATION_URL}/?page=1`;
        location_list_xhr = xhr(location_endpoint, 'GET', null, {}, 200, LF.list());
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

test('navigating between location and people and locations and category will not dirty models and will clear m2m models', function(assert) {
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-title').text(), 'Locations');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        const locations = store.find('location');
        assert.equal(locations.get('length'), 10);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 1);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    var page_two = `${PREFIX}${BASE_LOCATION_URL}/?page=2`;
    xhr(page_two,"GET",null,{},200,LF.list_two());
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), `${LOCATION_URL}?page=2`);
        assert.equal(find('.t-grid-title').text(), 'Locations');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        const locations = store.find('location');
        assert.equal(locations.get('length'), 9);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 1);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(find('.t-grid-title').text(), 'People');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        const locations = store.find('location');
        assert.equal(locations.get('length'), 9);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 11);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    var page_two_people = `${PREFIX}${BASE_PEOPLE_URL}/?page=2`;
    xhr(page_two_people,"GET",null,{},200,PF.list_two());
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
        const locations = store.find('location');
        assert.equal(locations.get('length'), 9);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 9);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-title').text(), 'Tickets');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        const locations = store.find('location');
        assert.equal(locations.get('length'), 10);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
            assert.ok(location.get('statusIsNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 10);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
        const tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 10);
        tickets.forEach((ticket) => {
            assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
    var page_two_cat = `${PREFIX}${BASE_TICKET_URL}/?page=2`;
    xhr(page_two_cat,"GET",null,{},200,TF.list_two());
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        const locations = store.find('location');
        assert.equal(locations.get('length'), 11);
        locations.forEach((location) => {
            assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        });
        const persons = store.find('person');
        assert.equal(persons.get('length'), 11);
        persons.forEach((person) => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
        const tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 9);
        tickets.forEach((ticket) => {
            assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
});

// test('navigating between ticket and people will not dirty models and will clear ticket from ticket-status and ticket-priority', function(assert) {
//     visit(TICKET_URL);
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_URL);
//         const tickets = store.find('ticket');
//         assert.equal(tickets.get('length'), 10);
//         tickets.forEach((ticket) => {
//             assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//         });
//         const ticket_priorities = store.find('ticket-priority');
//         assert.equal(ticket_priorities.get('length'), 4);
//         const ticket_statuses = store.find('ticket-status');
//         assert.equal(ticket_statuses.get('length'), 8);
//         assert.equal(ticket_statuses.objectAt(0).get('tickets').get('length'), 10);
//         assert.equal(ticket_priorities.objectAt(0).get('tickets').get('length'), 10);
//         const persons = store.find('person');
//         assert.equal(persons.get('length'), 2);
//         persons.forEach((person) => {
//             assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//         });
//         const locations = store.find('location');
//         assert.equal(locations.get('length'), 1);
//         locations.forEach((location) => {
//             assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//         });
//     });
//     var page_two = `${PREFIX}${BASE_TICKET_URL}/?page=2`;
//     xhr(page_two,"GET",null,{},200,TF.list_two());
//     click('.t-page:eq(1) a');
//     andThen(() => {
//         assert.equal(currentURL(), `${TICKET_URL}?page=2`);
//         assert.equal(find('.t-grid-title').text(), 'Tickets');
//         assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//         const tickets = store.find('ticket');
//         assert.equal(tickets.get('length'), 9);
//         tickets.forEach((ticket) => {
//             assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//         });
//         const ticket_priorities = store.find('ticket-priority');
//         assert.equal(ticket_priorities.get('length'), 4);
//         const ticket_statuses = store.find('ticket-status');
//         assert.equal(ticket_statuses.get('length'), 8);
//         assert.equal(ticket_statuses.objectAt(0).get('tickets').get('length'), 1);
//         assert.equal(ticket_priorities.objectAt(0).get('tickets').get('length'), 1);
//         assert.equal(ticket_statuses.objectAt(1).get('tickets').get('length'), 9);
//         assert.equal(ticket_priorities.objectAt(1).get('tickets').get('length'), 9);
//         const persons = store.find('person');
//         assert.equal(persons.get('length'), 3);
//         persons.forEach((person) => {
//             assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//         });
//         const locations = store.find('location');
//         assert.equal(locations.get('length'), 2);
//         locations.forEach((location) => {
//             assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//         });
//     });
//     visit(PEOPLE_URL);
//     andThen(() => {
//         assert.equal(currentURL(), PEOPLE_URL);
//         assert.equal(find('.t-grid-title').text(), 'People');
//         assert.equal(find('.t-grid-data').length, PAGE_SIZE);
//         const tickets = store.find('ticket');
//         assert.equal(tickets.get('length'), 9);
//         tickets.forEach((ticket) => {
//             assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//         });
//         const ticket_priorities = store.find('ticket-priority');
//         assert.equal(ticket_priorities.get('length'), 4);
//         const ticket_statuses = store.find('ticket-status');
//         assert.equal(ticket_statuses.get('length'), 8);
//         assert.equal(ticket_statuses.objectAt(0).get('tickets').get('length'), 1);
//         assert.equal(ticket_priorities.objectAt(0).get('tickets').get('length'), 1);
//         assert.equal(ticket_statuses.objectAt(1).get('tickets').get('length'), 9);
//         assert.equal(ticket_priorities.objectAt(1).get('tickets').get('length'), 9);
//         const persons = store.find('person');
//         assert.equal(persons.get('length'), 12);
//         persons.forEach((person) => {
//             assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//         });
//         const locations = store.find('location');
//         assert.equal(locations.get('length'), 2);
//         locations.forEach((location) => {
//             assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//         });
//     });
// });
