import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/automation';
import generalPage from 'bsrs-ember/tests/pages/general';
import AD from 'bsrs-ember/vendor/defaults/automation';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import AF from 'bsrs-ember/vendor/automation_fixtures';
import BASEURLS, { AUTOMATION_URL, AUTOMATION_LIST_URL, AUTOMATION_AVAILABLE_FILTERS_URL } from 'bsrs-ember/utilities/urls';


// Edit based on module
const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const TAB_TITLE_NAME = 'New automation';
const TAB_TITLE = AD.descriptionOne;
const MODEL = 'automation';
const ROUTE_NAME_NEW = 'admin.automations.new';
const ROUTE_NAME_DETAIL = 'admin.automations.automation';
const ROUTE_NAME_INDEX = 'admin.automations.index';
const ID_ONE = AD.idOne;
const ID_TWO = AD.idTwo;
const ID_GRID_TWO = AD.idGridTwo;
const EDIT_FIELD_VALUE = AD.descriptionTwo;

// Fixed
const NEW_URL = BASE_URL + '/new/1';
const NEW_URL_2 = BASE_URL + '/new/2';
const DETAIL_URL = BASE_URL + '/' + AD.idOne;


let application, list_xhr, endpoint, detail_xhr, detail_data_two, list_data, original_uuid, counter;

moduleForAcceptance('Acceptance | tab automation test', {
  beforeEach() {
    // Edit based on module
    const detail_data = AF.detail(ID_ONE);
    detail_xhr = xhr(`${AUTOMATION_URL}${ID_ONE}/`, 'GET', null, {}, 200, detail_data);
    detail_data_two = AF.detail(ID_GRID_TWO);
    list_data = AF.list();
  },
});

/* jshint ignore:start */

test('(NEW URL) deep linking the new automation url should push a tab into the tab this.store with correct properties', async function(assert) {
  clearxhr(detail_xhr);
  await visit(NEW_URL);
  assert.equal(currentURL(), NEW_URL);
  let tabs = this.store.find('tab');
  assert.equal(tabs.get('length'), 1);
  let tab = tabs.objectAt(0);
  assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE_NAME);
  assert.equal(tab.get('module'), MODEL);
  assert.equal(tab.get('routeName'), ROUTE_NAME_NEW);
  assert.equal(tab.get('redirectRoute'), ROUTE_NAME_INDEX);
  assert.equal(tab.get('newModel'), true);
});

test('deep linking the automation detail url should push a tab into the tab this.store with correct properties', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = this.store.find('tab', ID_ONE);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
    assert.equal(tab.get('module'), MODEL);
    assert.equal(tab.get('routeName'), ROUTE_NAME_DETAIL);
    assert.equal(tab.get('redirectRoute'), ROUTE_NAME_INDEX);
    assert.equal(tab.get('newModel'), false);
  });
});

test('visiting the automation detail url from the list url should push a tab into the tab this.store', async function(assert) {
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  await page.visit();
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  let tabs = this.store.find('tab');
  assert.equal(tabs.get('length'), 0);
  await generalPage.gridItemZeroClick();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(tabs.get('length'), 1);
  let tab = this.store.find('tab', ID_ONE);
  assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
  assert.equal(tab.get('module'), MODEL);
  assert.equal(tab.get('routeName'), ROUTE_NAME_DETAIL);
  assert.equal(tab.get('redirectRoute'), ROUTE_NAME_INDEX);
  assert.equal(tab.get('newModel'), false);
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', async function(assert) {
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  await page.visit();
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  let tabs = this.store.find('tab');
  assert.equal(tabs.get('length'), 0);
  await generalPage.gridItemZeroClick();
  assert.equal(currentURL(), DETAIL_URL);
  let model = this.store.find(MODEL, ID_ONE);
  assert.equal(model.get('isDirtyOrRelatedDirty'), false);
  assert.equal(tabs.get('length'), 1);
  assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
  await page.visit();
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  await click('.t-tab:eq(0)');
  assert.equal(model.get('isDirtyOrRelatedDirty'), false);
  assert.equal(currentURL(), DETAIL_URL);
});

test('clicking on a new model from the grid view will not dirty the original tab', function(assert) {
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let model = this.store.find(MODEL, ID_ONE);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
  detail_xhr = xhr(`${AUTOMATION_URL}${ID_GRID_TWO}/`, 'GET', null, {}, 200, detail_data_two);
  generalPage.gridItemOneClick();
  andThen(() => {
    assert.equal(currentURL(), `${BASE_URL}/${ID_GRID_TWO}`);
    let model = this.store.find(MODEL, ID_ONE);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
    let obj_two = this.store.find(MODEL, ID_GRID_TWO);
    assert.ok(obj_two.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('(NEW URL) clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', async function(assert) {
  clearxhr(detail_xhr);
  await visit(NEW_URL);
  assert.equal(currentURL(), NEW_URL);
  let tabs = this.store.find('tab');
  assert.equal(tabs.get('length'), 1);
  assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE_NAME);
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  await page.visit();
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  await click('.t-tab:eq(0)');
  assert.equal(currentURL(), NEW_URL);
});

test('(NEW URL) clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', async function(assert) {
  random.uuid = function() { return UUID.value; };
  clearxhr(detail_xhr);
  await visit(NEW_URL);
  assert.equal(currentURL(), NEW_URL);
  let tabs = this.store.find('tab');
  assert.equal(tabs.get('length'), 1);
  assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE_NAME);
  await page.descriptionFill(EDIT_FIELD_VALUE);
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  await page.visit();
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  let model = this.store.find(MODEL, UUID.value);
  assert.equal(model.get('description'), EDIT_FIELD_VALUE);
  assert.equal(model.get('isDirtyOrRelatedDirty'), true);
  await click('.t-tab:eq(0)');
  assert.equal(currentURL(), NEW_URL);
  assert.equal(model.get('description'), EDIT_FIELD_VALUE);
  assert.equal(model.get('isDirtyOrRelatedDirty'), true);
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', function(assert) {
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  page.descriptionFill(EDIT_FIELD_VALUE);
  andThen(() => {
    let model = this.store.find(MODEL, ID_ONE);
    assert.equal(model.get('description'), EDIT_FIELD_VALUE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), true);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), EDIT_FIELD_VALUE);
  });
  andThen(() => {
    page.visit();
    andThen(() => {
      assert.equal(currentURL(), AUTOMATION_LIST_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let model = this.store.find(MODEL, ID_ONE);
    assert.equal(model.get('description'), EDIT_FIELD_VALUE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('a dirty model should add the dirty class to the tab close icon', async function(assert) {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find('.dirty').length, 0);
  let tabs = this.store.find('tab');
  assert.equal(tabs.get('length'), 1);
  assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
  await page.descriptionFill(EDIT_FIELD_VALUE);
  assert.equal(find('.dirty').length, 1);
});

test('closing a document should close it\'s related tab', function(assert) {
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
    click('.t-cancel-btn:eq(0)');
    andThen(() => {
      assert.equal(tabs.get('length'), 0);
    });
  });
});

test('opening a new tab, navigating away and closing the tab should remove the tab', function(assert) {
  clearxhr(detail_xhr);
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE_NAME);
    page.visit();
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, navigating away and closing the tab should remove the tab', function(assert) {
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
    page.visit();
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', async function(assert) {
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  let tabs = this.store.find('tab');
  assert.equal(tabs.get('length'), 1);
  assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
  await page.descriptionFill(EDIT_FIELD_VALUE);
  assert.equal(find('.dirty').length, 1);
  assert.equal(find('.t-tab-title:eq(0)').text(), EDIT_FIELD_VALUE);
  await page.visit();
  await click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
    waitFor(assert, () => {
      assert.equal(find('.t-modal-body').length, 1);
    });
  });
});

test('(NEW URL) clicking on the new link with a new tab of the same type open will redirect to open tab', async function(assert) {
  clearxhr(detail_xhr);
  await visit(NEW_URL);
  assert.equal(currentURL(), NEW_URL);
  let tabs = this.store.find('tab');
  assert.equal(tabs.get('length'), 1);
  assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE_NAME);
  await page.descriptionFill(EDIT_FIELD_VALUE);
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  await page.visit();
  await assert.equal(currentURL(), AUTOMATION_LIST_URL);
  assert.equal(tabs.get('length'), 1);
  await click('.t-add-new');
  assert.equal(currentURL(), NEW_URL_2);
  assert.equal(tabs.get('length'), 2);
});

test('(NEW URL) clicking on an open new tab will redirect to the new tab', async function(assert) {
  clearxhr(detail_xhr);
  list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, list_data);
  await page.visit();
  await click('.t-add-new');
  assert.equal(currentURL(), NEW_URL);
  let tabs = this.store.find('tab');
  assert.equal(tabs.get('length'), 1);
  await page.visit();
  await click('.t-tab:eq(0)');
  assert.equal(currentURL(), NEW_URL);
  assert.equal(tabs.get('length'), 1);
});

/* jshint ignore:end */
