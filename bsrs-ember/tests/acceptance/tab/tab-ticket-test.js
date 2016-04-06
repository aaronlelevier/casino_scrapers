import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import CF from 'bsrs-ember/vendor/category_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import RF from 'bsrs-ember/vendor/role_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/tickets';
import generalPage from 'bsrs-ember/tests/pages/general';

const PREFIX = config.APP.NAMESPACE;
const BASE_TICKET_URL = BASEURLS.base_tickets_url;
const BASE_ROLE_URL = BASEURLS.base_roles_url;
const TICKET_URL = BASE_TICKET_URL + '/index';
const NEW_URL = BASE_TICKET_URL + '/new/1';
const NEW_URL_2 = BASE_TICKET_URL + '/new/2';
const DETAIL_URL = BASE_TICKET_URL + '/' + TD.idOne;
const ROLE_URL = BASE_ROLE_URL + '/index';
const NEW_ROUTE = 'tickets.new';
const INDEX_ROUTE = 'tickets.index';
const DETAIL_ROUTE = 'tickets.ticket';
const DOC_TYPE = 'ticket';
const TAB_TITLE = '.t-tab-title:eq(0)';

let application, store, list_xhr, ticket_detail_data, endpoint, detail_xhr, original_uuid, activity_one;

module('Acceptance | tab ticket test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    endpoint = PREFIX + BASE_TICKET_URL + '/';
    ticket_detail_data = TF.detail(TD.idOne);
    detail_xhr = xhr(endpoint + TD.idOne + '/', 'GET', null, {}, 200, ticket_detail_data);
    activity_one = xhr(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
    original_uuid = random.uuid;
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

test('(NEW URL) deep linking the new ticket url should push a tab into the tab store with correct properties', (assert) => {
  clearxhr(detail_xhr);
  clearxhr(activity_one);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = tabs.objectAt(0);
    assert.equal(find(TAB_TITLE).text(), 'New Ticket');
    assert.equal(tab.get('module'), 'ticket');
    assert.equal(tab.get('routeName'), NEW_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), true);
  });
});

test('deep linking the ticket detail url should push a tab into the tab store with correct properties', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    const tab = store.find('tab', TD.idOne);
    const ticket = store.find('ticket', TD.idOne);
    const sorted_cat = ticket.get('sorted_categories');
    assert.equal(find(TAB_TITLE).text(), `#${ticket.get('number')} - ${sorted_cat[sorted_cat.length-1].get('name')}`);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

//TODO: update once get click category children components
// test('changing the categories should update the tab title', (assert) => {
//     visit(DETAIL_URL);
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         let tabs = store.find('tab');
//         assert.equal(tabs.get('length'), 1);
//         const tab = store.find('tab', TD.idOne);
//         const ticket = store.find('ticket', TD.idOne);
//         const sorted_cat = ticket.get('sorted_categories');
//         assert.equal(find(TAB_TITLE).text(), `#${ticket.get('number')} - ${sorted_cat[sorted_cat.length-1].get('name')}`);
//     });
//     page.categoryTwoClickDropdown();
//     page.categoryTwoClickOptionElectrical();
//     andThen(() => {
//         let tabs = store.find('tab');
//         assert.equal(tabs.get('length'), 1);
//         const tab = store.find('tab', TD.idOne);
//         const ticket = store.find('ticket', TD.idOne);
//         const sorted_cat = ticket.get('sorted_categories');
//         assert.equal(find(TAB_TITLE).text(), `#${ticket.get('number')} - ${sorted_cat[sorted_cat.length-1].get('name')}`);
//     });
// });

test('visiting the ticket detail url from the list url should push a tab into the tab store', (assert) => {
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', TD.idOne);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and fire off an xhr request', (assert) => {
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('isDirtyOrRelatedDirty'), false);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    // assert.equal(ticket.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('(NEW URL) clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  clearxhr(detail_xhr);
  clearxhr(activity_one);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find(TAB_TITLE).text(), 'New Ticket');
  });
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
});

test('(NEW URL) clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  random.uuid = function() { return UUID.value; };
  clearxhr(detail_xhr);
  clearxhr(activity_one);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find(TAB_TITLE).text(), 'New Ticket');
  });
  page.priorityClickDropdown();
  page.priorityClickOptionTwo();
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    let ticket = store.find('ticket').objectAt(0);
    assert.equal(ticket.get('priority').get('id'), TD.priorityTwoId);
    assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let ticket = store.find('ticket').objectAt(0);
    assert.equal(page.priorityInput, TD.priorityTwo);
    assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
  });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  page.priorityClickDropdown();
  page.priorityClickOptionTwo();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(page.priorityInput, TD.priorityTwo);
    assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  andThen(() => {
    visit(TICKET_URL);
    andThen(() => {
      assert.equal(currentURL(), TICKET_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(page.priorityInput, TD.priorityTwo);
    assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a new model from the grid view will not dirty the original tab', (assert) => {
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  });
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  });
  const id = 'bf2b9c85-f6bd-4345-9834-c5d51de53d02';
  const data = TF.detail(id);
  data.cc = [PF.get(PD.idTwo)];
  ajax(endpoint + id + '/', 'GET', null, {}, 200, data);
  ajax(`/api/tickets/${id}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
  click('.t-grid-data:eq(1)');
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(ticket.get('ccIsNotDirty'));
    let ticket_two = store.find('ticket', id);
    assert.ok(ticket_two.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(currentURL(), `/tickets/${id}`);
  });
});

test('clicking on a tab that is dirty from the role url (or any non related page) should take you to the detail url and not fire off an xhr request', (assert) => {
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  page.priorityClickDropdown();
  page.priorityClickOptionTwo();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(page.priorityInput, TD.priorityTwo);
    assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  andThen(() => {
    let endpoint = PREFIX + BASE_ROLE_URL + '/';
    xhr(endpoint + '?page=1','GET',null,{},200,RF.list());
    visit(ROLE_URL);
    andThen(() => {
      assert.equal(currentURL(), ROLE_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(page.priorityInput, TD.priorityTwo);
    assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is not dirty from the role url (or any non related page) should take you to the detail url and fire off an xhr request', (assert) => {
  xhr(endpoint + '?page=1','GET',null,{},200,TF.list());
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let ticket = store.find('ticket', TD.idOne);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  let role_endpoint = PREFIX + BASE_ROLE_URL + '/';
  xhr(role_endpoint + '?page=1','GET',null,{},200, RF.list());
  visit(ROLE_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('a dirty model should add the dirty class to the tab close icon', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.dirty').length, 0);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  page.priorityClickDropdown();
  page.priorityClickOptionTwo();
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
});

test('closing a document should close it\'s related tab', (assert) => {
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    click('.t-cancel-btn:eq(0)');
    andThen(() => {
      assert.equal(tabs.get('length'), 0);
    });
  });
});

test('opening a new tab, navigating away and closing the tab should remove the tab', (assert) => {
  clearxhr(detail_xhr);
  clearxhr(activity_one);
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  visit(TICKET_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, navigating away and closing the tab should remove the tab', (assert) => {
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  visit(TICKET_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', (assert) => {
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  page.priorityClickDropdown();
  page.priorityClickOptionTwo();
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
  visit(TICKET_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    waitFor(() => {
      assert.ok(generalPage.modalIsVisible);
      assert.ok(generalPage.deleteModalIsHidden);
      assert.equal(find('.t-modal-body').length, 1);
    });
  });
});

test('(NEW URL) a dirty new tab and clicking on new model button should push new tab into store', (assert) => {
  clearxhr(detail_xhr);
  clearxhr(activity_one);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find(TAB_TITLE).text(), 'New Ticket');
  });
  page.priorityClickDropdown();
  page.priorityClickOptionTwo();
  let ticket_list_data = TF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL_2);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 2);
  });
});
