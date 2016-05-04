import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import PF from 'bsrs-ember/vendor/people_fixtures';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import PD_PUT from 'bsrs-ember/vendor/defaults/person-put';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const BASE_ROLE_URL = BASEURLS.base_roles_url;
const PEOPLE_URL = BASE_PEOPLE_URL + '/index';
const NEW_URL = BASE_PEOPLE_URL + '/new/1';
const NEW_URL_2 = BASE_PEOPLE_URL + '/new/2';
const DETAIL_URL = BASE_PEOPLE_URL + '/' + PD.id;
const ROLE_URL = BASE_ROLE_URL + '/index';

let application, store, list_xhr, people_detail_data, endpoint, detail_xhr, original_uuid, counter;

module('Acceptance | tab people test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_PEOPLE_URL + '/';
    people_detail_data = PF.detail(PD.id);
    detail_xhr = xhr(`${endpoint}${PD.idOne}/`, 'GET', null, {}, 200, people_detail_data);
    original_uuid = random.uuid;
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

test('(NEW URL) deep linking the new people url should push a tab into the tab store with correct properties', (assert) => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = tabs.objectAt(0);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Person');
    assert.equal(tab.get('module'), 'person');
    assert.equal(tab.get('routeName'), 'admin.people.new');
    assert.equal(tab.get('redirectRoute'), 'admin.people.index');
    assert.equal(tab.get('newModel'), true);
  });
});

test('deep linking the people detail url should push a tab into the tab store with correct properties', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', PD.id);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.fullname);
    assert.equal(tab.get('module'), 'person');
    assert.equal(tab.get('routeName'), 'admin.people.person');
    assert.equal(tab.get('redirectRoute'), 'admin.people.index');
    assert.equal(tab.get('newModel'), false);
  });
});

test('visiting the people detail url from the list url should push a tab into the tab store', (assert) => {
  let people_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', PD.id);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.fullname);
    assert.equal(tab.get('module'), 'person');
    assert.equal(tab.get('routeName'), 'admin.people.person');
    assert.equal(tab.get('redirectRoute'), 'admin.people.index');
    assert.equal(tab.get('newModel'), false);
  });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  let people_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let person = store.find('person', PD.id);
    assert.equal(person.get('isDirtyOrRelatedDirty'), false);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.fullname);
  });
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let person = store.find('person', PD.id);
    assert.equal(person.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a new model from the grid view will not dirty the original tab', (assert) => {
  let person_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, person_list_data);
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let person = store.find('person', PD.idOne);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  });
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
  });
  const secondId = PD.personListTwo;
  const donald_detail_data = PF.detail(secondId);
  detail_xhr = xhr(`${endpoint}${secondId}/`, 'GET', null, {}, 200, donald_detail_data);
  click('.t-grid-data:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), `/admin/people/${secondId}`);
    let person = store.find('person', PD.idOne);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('locationsIsNotDirty'));
    let person_two = store.find('person', secondId);
    assert.ok(person_two.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('(NEW URL) clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Person');
  });
  let people_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
});

test('(NEW URL) clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  random.uuid = function() { return UUID.value; };
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Person');
  });
  const username_response = {'count':1,'next':null,'previous':null,'results': [{'id': PD.idOne}]};
  const username_search = xhr(endpoint + '?username=llcoolj', 'GET', null, {}, 200, username_response);
  fillIn('.t-person-username', PD_PUT.username);
  let people_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    let person = store.find('person', UUID.value);
    assert.equal(person.get('username'), PD_PUT.username);
    assert.equal(person.get('isDirtyOrRelatedDirty'), true);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let person = store.find('person', UUID.value);
    assert.equal(person.get('username'), PD_PUT.username);
    assert.equal(person.get('isDirtyOrRelatedDirty'), true);
  });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  let people_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  const username_response = {'count':0,'next':null,'previous':null,'results': []};
  xhr(`${endpoint}?username=${PD_PUT.username}`, 'get', null, {}, 200, username_response);
  fillIn('.t-person-username', PD_PUT.username);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let person = store.find('person', PD.id);
    assert.equal(person.get('username'), PD_PUT.username);
    assert.equal(person.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.fullname);
  });
  andThen(() => {
    visit(PEOPLE_URL);
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let person = store.find('person', PD.id);
    assert.equal(person.get('username'), PD_PUT.username);
    assert.equal(person.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is dirty from the role url (or any non related page) should take you to the detail url and not fire off an xhr request', (assert) => {
  let people_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  const username_response = {'count':0,'next':null,'previous':null,'results': []};
  xhr(`${endpoint}?username=${PD_PUT.username}`, 'get', null, {}, 200, username_response);
  fillIn('.t-person-username', PD_PUT.username);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let person = store.find('person', PD.id);
    assert.equal(person.get('username'), PD_PUT.username);
    assert.equal(person.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.fullname);
  });
  andThen(() => {
    let endpoint = PREFIX + BASE_ROLE_URL + '/';
    xhr(endpoint + '?page=1','GET',null,{},200,ROLE_FIXTURES.list());
    visit(ROLE_URL);
    andThen(() => {
      assert.equal(currentURL(), ROLE_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let person = store.find('person', PD.id);
    assert.equal(person.get('username'), PD_PUT.username);
    assert.equal(person.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is not dirty from the role url (or any non related page) should take you to the detail url and fire off an xhr request', (assert) => {
  xhr(endpoint + '?page=1','GET',null,{},200,PF.list());
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let person = store.find('person', PD.id);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.fullname);
  });
  let role_endpoint = PREFIX + BASE_ROLE_URL + '/';
  xhr(role_endpoint + '?page=1','GET',null,{},200,ROLE_FIXTURES.list());
  click('.t-nav-admin-role');
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let person = store.find('person', PD.id);
    assert.equal(person.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('a dirty model should add the dirty class to the tab close icon', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('i.dirty').length, 0);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.fullname);
  });
  fillIn('.t-person-first-name', PD_PUT.username);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
});

test('closing a document should close it\'s related tab', (assert) => {
  let people_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.fullname);
    click('.t-cancel-btn:eq(0)');
    andThen(() => {
      assert.equal(tabs.get('length'), 0);
    });
  });
});

test('opening a new tab, navigating away and closing the tab should remove the tab', (assert) => {
  clearxhr(detail_xhr);
  let people_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Person');
    visit(PEOPLE_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, navigating away and closing the tab should remove the tab', (assert) => {
  let people_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.fullname);
    visit(PEOPLE_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', (assert) => {
  let people_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.fullname);
  });
  fillIn('.t-person-first-name', PD_PUT.username);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), `${PD_PUT.username} ${PD.last_name}`);
  });
  visit(PEOPLE_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    waitFor(assert, () => {
      assert.equal(find('.t-modal-body').length, 1);
    });
  });
});

test('(NEW URL) clicking on the new link with a new tab of the same type open will redirect to open tab', (assert) => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Person');
  });
  const username_response = {'count':1,'next':null,'previous':null,'results': [{'id': PD.idOne}]};
  const username_search = xhr(endpoint + '?username=llcoolj', 'GET', null, {}, 200, username_response);
  fillIn('.t-person-username', PD_PUT.username);
  let people_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL_2);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 2);
  });
});
