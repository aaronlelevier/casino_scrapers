import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PF from 'bsrs-ember/vendor/people_fixtures';
import CF from 'bsrs-ember/vendor/category_fixtures';
import LF from 'bsrs-ember/vendor/location_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS, {
  TICKET_LIST_URL,
  PEOPLE_LIST_URL,
  CATEGORY_LIST_URL,
  LOCATION_LIST_URL
} from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_TICKET_URL = BASEURLS.base_tickets_url;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const BASE_CATEGORY_URL = BASEURLS.base_categories_url;
const BASE_LOCATION_URL = BASEURLS.base_locations_url;

var application, ticket_endpoint, ticket_list_xhr, people_endpoint, people_list_xhr, category_endpoint, category_list_xhr, functionalStore;

moduleForAcceptance('Acceptance | ticket multiple grid test', {
  beforeEach() {
    functionalStore = this.application.__container__.lookup('service:functional-store');
    ticket_endpoint = `${PREFIX}${BASE_TICKET_URL}/?page=1`;
    ticket_list_xhr = xhr(ticket_endpoint, 'GET', null, {}, 200, TF.list());
    people_endpoint = `${PREFIX}${BASE_PEOPLE_URL}/?page=1`;
    people_list_xhr = xhr(people_endpoint, 'GET', null, {}, 200, PF.list());
  },
});

test('navigating between ticket and people and locations and category will not dirty models and will clear m2m models (categories only)', function(assert) {
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-title').text(), 'Tickets');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-priority-translated_name').text().trim(), TD.priorityOne);
    const tickets = functionalStore.find('ticket-list');
    assert.equal(tickets.get('length'), 10);
    tickets.forEach((ticket) => {
      assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
    // const ticket_cats = this.store.find('model-category');
    // assert.equal(ticket_cats.get('length'), 30);
    // const categorys = this.store.find('category');
    // assert.equal(categorys.get('length'), 3);
    // categorys.forEach((category) => {
    //     assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    // });
    const persons = this.store.find('person-list');
    assert.equal(persons.get('length'), 0);
    const people = this.store.find('person');
    assert.equal(people.get('length'), 1);
    people.forEach((person) => {
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });
  var page_two = `${PREFIX}${BASE_TICKET_URL}/?page=2`;
  xhr(page_two,"GET",null,{},200,TF.list_two());
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), `${TICKET_LIST_URL}?page=2`);
    assert.equal(find('.t-grid-title').text(), 'Tickets');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    const tickets = functionalStore.find('ticket-list');
    assert.equal(tickets.get('length'), 9);
    tickets.forEach((ticket) => {
      assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
    // const ticket_cats = this.store.find('model-category');
    // assert.equal(ticket_cats.get('length'), 9);
    // const categorys = this.store.find('category');
    // assert.equal(categorys.get('length'), 3);
    // categorys.forEach((category) => {
    //     assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    // });
    const persons = this.store.find('person-list');
    assert.equal(persons.get('length'), 0);
    const people = this.store.find('person');
    assert.equal(people.get('length'), 1);
    people.forEach((person) => {
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-title').text(), 'People');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    const tickets = functionalStore.find('ticket-list');
    assert.equal(tickets.get('length'), 9);
    tickets.forEach((ticket) => {
      assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
    // const ticket_cats = this.store.find('model-category');
    // assert.equal(ticket_cats.get('length'), 9);
    // const categorys = this.store.find('category');
    // assert.equal(categorys.get('length'), 3);
    // categorys.forEach((category) => {
    //     assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    // });
    const persons = this.store.find('person-list');
    assert.equal(persons.get('length'), 10);
    persons.forEach((person) => {
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });
  var page_two_people = `${PREFIX}${BASE_PEOPLE_URL}/?page=2`;
  xhr(page_two_people,"GET",null,{},200,PF.list_two());
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
    const tickets = functionalStore.find('ticket-list');
    assert.equal(tickets.get('length'), 9);
    tickets.forEach((ticket) => {
      assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
    // const ticket_cats = this.store.find('model-category');
    // assert.equal(ticket_cats.get('length'), 9);
    // const categorys = this.store.find('category');
    // assert.equal(categorys.get('length'), 3);
    // categorys.forEach((category) => {
    //     assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    // });
    const persons = this.store.find('person-list');
    assert.equal(persons.get('length'), 8);
    persons.forEach((person) => {
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });
  category_endpoint = `${PREFIX}${BASE_CATEGORY_URL}/?page=1`;
  category_list_xhr = xhr(category_endpoint, 'GET', null, {}, 200, CF.list());
  visit(CATEGORY_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_LIST_URL);
    assert.equal(find('.t-grid-title').text(), 'Categories');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    const tickets = functionalStore.find('ticket-list');
    assert.equal(tickets.get('length'), 9);
    tickets.forEach((ticket) => {
      assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
    // const ticket_cats = this.store.find('model-category');
    // assert.equal(ticket_cats.get('length'), 9);
    // const categorys = this.store.find('category');
    // assert.equal(categorys.get('length'), 13);
    // categorys.forEach((category) => {
    //     assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    // });
    const persons = this.store.find('person-list');
    assert.equal(persons.get('length'), 8);
    persons.forEach((person) => {
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });
  var page_two_cat = `${PREFIX}${BASE_CATEGORY_URL}/?page=2`;
  xhr(page_two_cat,"GET",null,{},200,CF.list_two());
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    const tickets = functionalStore.find('ticket-list');
    assert.equal(tickets.get('length'), 9);
    tickets.forEach((ticket) => {
      assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
    // const ticket_cats = this.store.find('model-category');
    // assert.equal(ticket_cats.get('length'), 9);
    // const categorys = this.store.find('category');
    // assert.equal(categorys.get('length'), 12);
    // categorys.forEach((category) => {
    //     assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    // });
    const persons = this.store.find('person-list');
    assert.equal(persons.get('length'), 8);
    persons.forEach((person) => {
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });
  const location_endpoint = `${PREFIX}${BASE_LOCATION_URL}/?page=1`;
  const location_list_xhr = xhr(location_endpoint, 'GET', null, {}, 200, LF.list());
  visit(LOCATION_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LIST_URL);
    assert.equal(find('.t-grid-title').text(), 'Locations');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    const tickets = functionalStore.find('ticket-list');
    assert.equal(tickets.get('length'), 9);
    // const ticket_cats = this.store.find('model-category');
    // assert.equal(ticket_cats.get('length'), 9);
    // const categorys = this.store.find('category');
    // assert.equal(categorys.get('length'), 12);
    // categorys.forEach((category) => {
    //     assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    // });
    const persons = this.store.find('person-list');
    assert.equal(persons.get('length'), 8);
    persons.forEach((person) => {
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });
  var page_two_loc = `${PREFIX}${BASE_LOCATION_URL}/?page=2`;
  xhr(page_two_loc,"GET",null,{},200,LF.list_two());
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    const tickets = functionalStore.find('ticket-list');
    assert.equal(tickets.get('length'), 9);
    tickets.forEach((ticket) => {
      assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
    // const ticket_cats = this.store.find('model-category');
    // assert.equal(ticket_cats.get('length'), 9);
    // const categorys = this.store.find('category');
    // assert.equal(categorys.get('length'), 12);
    // categorys.forEach((category) => {
    //     assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    // });
    const persons = this.store.find('person-list');
    assert.equal(persons.get('length'), 8);
    persons.forEach((person) => {
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-title').text(), 'Tickets');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-priority-translated_name').text().trim(), TD.priorityOne);
    const tickets = functionalStore.find('ticket-list');
    assert.equal(tickets.get('length'), 10);
    tickets.forEach((ticket) => {
      assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
    // const ticket_cats = this.store.find('model-category');
    // assert.equal(ticket_cats.get('length'), 39);
    // const categorys = this.store.find('category');
    // assert.equal(categorys.get('length'), 12);
    // categorys.forEach((category) => {
    //     assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    // });
    const persons = this.store.find('person-list');
    //no gc for person-list b/c doesn't deal with person list
    assert.equal(persons.get('length'), 8);
    persons.forEach((person) => {
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });
});
