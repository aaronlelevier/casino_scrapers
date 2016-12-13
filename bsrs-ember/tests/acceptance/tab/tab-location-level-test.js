import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import LLF from 'bsrs-ember/vendor/location-level_fixtures';
import RF from 'bsrs-ember/vendor/role_fixtures';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import random from 'bsrs-ember/models/random';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { PREFIX, ROLE_LIST_URL } from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.base_location_levels_url;
const LOCATION_LEVEL_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new/1';
const NEW_URL_2 = BASE_URL + '/new/2';
const DJANGO_DETAIL_URL = PREFIX + BASE_URL + '/' + LLD.idOne + '/';
const DETAIL_URL = BASE_URL + '/' + LLD.idOne;
const NEW_ROUTE = 'admin.location-levels.new';
const INDEX_ROUTE = 'admin.location-levels.index';
const DETAIL_ROUTE = 'admin.location-levels.location-level';
const DOC_TYPE = 'location-level';

let application, list_xhr, location_detail_data, endpoint, detail_xhr;

moduleForAcceptance('Acceptance | tab location-level test', {
  beforeEach() {
    endpoint = PREFIX + BASE_URL + '/';
    location_detail_data = LLF.detail(LLD.idOne);
    detail_xhr = xhr(DJANGO_DETAIL_URL, 'GET', null, {}, 200, location_detail_data);
  },
  afterEach() {
  }
});

test('(NEW URL) deep linking the new location url should push a tab into the tab store with correct properties', function(assert) {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = tabs.objectAt(0);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New location-level');
    assert.equal(tab.get('module'), 'location-level');
    assert.equal(tab.get('routeName'), NEW_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), true);
  });
});

test('deep linking the location-level detail url should push a tab into the tab store with correct properties', function(assert) {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = this.store.find('tab', LLD.idOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), LLD.nameCompany);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('visiting the location detail url from the list url should push a tab into the tab store', function(assert) {
  let location_list_data = LLF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_LEVEL_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = this.store.find('tab', LLD.idOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), LLD.nameCompany);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', function(assert) {
  let location_list_data = LLF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_LEVEL_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let location = this.store.find('location-level', LLD.idOne);
    assert.equal(location.get('isDirtyOrRelatedDirty'), false);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LLD.nameCompany);
  });
  visit(LOCATION_LEVEL_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let location = this.store.find('location-level', LLD.idOne);
    assert.equal(location.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('(NEW URL) clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', function(assert) {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New location-level');
  });
  let location_list_data = LLF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_LEVEL_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
});

test('(NEW URL) clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', function(assert) {
  random.uuid = function() { return UUID.value; };
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New location-level');
  });
  fillIn('.t-location-level-name', LLD.nameCompany);
  let location_list_data = LLF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_LEVEL_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    let location = this.store.find('location-level', UUID.value);
    assert.equal(location.get('name'), LLD.nameCompany);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let location = this.store.find('location-level', UUID.value);
    assert.equal(location.get('name'), LLD.nameCompany);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
  });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', function(assert) {
  let location_list_data = LLF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_LEVEL_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  fillIn('.t-location-level-name', LLD.nameDistrict);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let location = this.store.find('location-level', LLD.idOne);
    assert.equal(location.get('name'), LLD.nameDistrict);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LLD.nameDistrict);
  });
  andThen(() => {
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
      assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let location = this.store.find('location-level', LLD.idOne);
    assert.equal(location.get('name'), LLD.nameDistrict);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is dirty from the role url (or any non related page) should take you to the detail url and not fire off an xhr request', function(assert) {
  let location_list_data = LLF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(LOCATION_LEVEL_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  fillIn('.t-location-level-name', LLD.nameDistrict);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let location = this.store.find('location-level', LLD.idOne);
    assert.equal(location.get('name'), LLD.nameDistrict);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LLD.nameDistrict);
  });
  andThen(() => {
    let endpoint = PREFIX + ROLE_LIST_URL + '/';
    xhr(endpoint + '?page=1','GET',null,{},200,RF.list());
  });
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    let location = this.store.find('location-level', LLD.idOne);
    assert.equal(location.get('name'), LLD.nameDistrict);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let location = this.store.find('location-level', LLD.idOne);
    assert.equal(location.get('name'), LLD.nameDistrict);
    assert.equal(location.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is not dirty from the role url (or any non related page) should take you to the detail url and fire off an xhr request', function(assert) {
  xhr(endpoint + '?page=1','GET',null,{},200,LLF.list());
  visit(LOCATION_LEVEL_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let location = this.store.find('location-level', LLD.idOne);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LLD.nameCompany);
  });
  let role_endpoint = PREFIX + ROLE_LIST_URL + '/';
  xhr(role_endpoint + '?page=1','GET',null,{},200, RF.list());
  click('.t-nav-admin-role');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let location = this.store.find('location-level', LLD.idOne);
    assert.equal(location.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('a dirty model should add the dirty class to the tab close icon', function(assert) {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.dirty').length, 0);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LLD.nameCompany);
  });
  fillIn('.t-location-level-name', LLD.nameDistrict);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
});

test('closing a document should close it\'s related tab', function(assert) {
  let location_list_data = LLF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LLD.nameCompany);
    click('.t-cancel-btn:eq(0)');
    andThen(() => {
      assert.equal(tabs.get('length'), 0);
    });
  });
});

test('opening a new tab, navigating away and closing the tab should remove the tab', function(assert) {
  clearxhr(detail_xhr);
  let location_list_data = LLF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New location-level');
    visit(LOCATION_LEVEL_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, navigating away and closing the tab should remove the tab', function(assert) {
  let location_list_data = LLF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LLD.nameCompany);
    visit(LOCATION_LEVEL_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', function(assert) {
  let location_list_data = LLF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), LLD.nameCompany);
  });
  fillIn('.t-location-level-name', LLD.nameDistrict);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), `${LLD.nameDistrict}`);
  });
  visit(LOCATION_LEVEL_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    waitFor(assert, () => {
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.close_tab'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
});

test('(NEW URL) clicking on the new link with a new tab of the same type open will redirect to open tab', function(assert) {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New location-level');
  });
  fillIn('.t-location-level-name', LLD.nameCompany);
  let location_list_data = LLF.list();
  xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
  generalPage.clickLocationLevel();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL_2);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 2);
  });
});
