import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import LF from 'bsrs-ember/vendor/location_fixtures';
import RF from 'bsrs-ember/vendor/role_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import random from 'bsrs-ember/models/random';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { PREFIX, ROLE_LIST_URL } from 'bsrs-ember/utilities/urls';

const BASE_LOCATION_URL = BASEURLS.base_locations_url;
const LOCATION_URL = BASE_LOCATION_URL + '/index';
const NEW_URL = BASE_LOCATION_URL + '/new/1';
const NEW_URL_2 = BASE_LOCATION_URL + '/new/2';
const DETAIL_URL = BASE_LOCATION_URL + '/' + LD.idOne;
const NEW_ROUTE = 'admin.locations.new';
const INDEX_ROUTE = 'admin.locations.index';
const DETAIL_ROUTE = 'admin.locations.location';
const DOC_TYPE = 'location';

let application, store, list_xhr, location_detail_data, endpoint, detail_xhr;

moduleForAcceptance('Acceptance | tab location test', {
  beforeEach() {

    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_LOCATION_URL + '/';
    location_detail_data = LF.detail(LD.idOne);
    detail_xhr = xhr(endpoint + LD.idOne + '/', 'GET', null, {}, 200, location_detail_data);
  },
  afterEach() {
  }
});

test('(NEW URL) deep linking the new location url should push a tab into the tab store with correct properties', (assert) => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = tabs.objectAt(0);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Location');
    assert.equal(tab.get('module'), 'location');
    assert.equal(tab.get('routeName'), NEW_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), true);
  });
});

test('deep linking the location detail url should push a tab into the tab store with correct properties', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', LD.idOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), LD.baseStoreName);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('visiting the location detail url from the list url should push a tab into the tab store', (assert) => {
  let location_list_data = LF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', LD.idOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), LD.baseStoreName);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  let location_list_data = LF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('isDirtyOrRelatedDirty'), false);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LD.baseStoreName);
  });
  visit(LOCATION_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('(NEW URL) clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Location');
  });
  let location_list_data = LF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Location');
  });
  fillIn('.t-location-name', LD.storeName);
  let location_list_data = LF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    let location = store.find('location', UUID.value);
    assert.equal(location.get('name'), LD.storeName);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let location = store.find('location', UUID.value);
    assert.equal(location.get('name'), LD.storeName);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
  });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  let location_list_data = LF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  fillIn('.t-location-name', LD.storeName);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('name'), LD.storeName);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LD.storeName);
  });
  visit(LOCATION_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('name'), LD.storeName);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is dirty from the role url (or any non related page) should take you to the detail url and not fire off an xhr request', (assert) => {
  let location_list_data = LF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  fillIn('.t-location-name', LD.storeName);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('name'), LD.storeName);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LD.storeName);
  });
  andThen(() => {
    let endpoint = PREFIX + ROLE_LIST_URL + '/';
    xhr(endpoint + '?page=1','GET',null,{},200,RF.list());
    visit(ROLE_LIST_URL);
    andThen(() => {
      assert.equal(currentURL(), ROLE_LIST_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('name'), LD.storeName);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is not dirty from the role url (or any non related page) should take you to the detail url and fire off an xhr request', (assert) => {
  xhr(endpoint + '?page=1','GET',null,{},200,LF.list());
  visit(LOCATION_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let location = store.find('location', LD.idOne);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LD.baseStoreName);
  });
  let role_endpoint = PREFIX + ROLE_LIST_URL + '/';
  xhr(role_endpoint + '?page=1','GET',null,{},200, RF.list());
  click('.t-nav-admin-role');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('isDirtyOrRelatedDirty'), false);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), LD.baseStoreName);
  });
  fillIn('.t-location-name', LD.storeName);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
});

test('closing a document should close it\'s related tab', (assert) => {
  let location_list_data = LF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LD.baseStoreName);
    click('.t-cancel-btn:eq(0)');
    andThen(() => {
      assert.equal(tabs.get('length'), 0);
    });
  });
});

test('opening a new tab, navigating away and closing the tab should remove the tab', (assert) => {
  clearxhr(detail_xhr);
  let location_list_data = LF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Location');
    visit(LOCATION_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, navigating away and closing the tab should remove the tab', (assert) => {
  let location_list_data = LF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LD.baseStoreName);
    visit(LOCATION_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', (assert) => {
  let location_list_data = LF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LD.baseStoreName);
  });
  fillIn('.t-location-name', LD.storeName);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), `${LD.storeName}`);
  });
  visit(LOCATION_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    waitFor(assert, () => {
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.close_tab'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
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
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Location');
  });
  fillIn('.t-location-name', LD.storeName);
  let location_list_data = LF.list();
  xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  generalPage.clickLocations();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL_2);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 2);
  });
});
