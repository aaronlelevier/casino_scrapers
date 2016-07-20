
import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import random from 'bsrs-ember/models/random';
// Edit
import PF from 'bsrs-ember/vendor/profile_fixtures';
import PD from 'bsrs-ember/vendor/defaults/profile';
import BASEURLS from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';


// Edit based on module
const BASE_URL = BASEURLS.base_profile_url;
const API_LIST_URL = `${config.APP.NAMESPACE}${BASE_URL}/`;
const TAB_TITLE_NAME = 'New Profile';
const TAB_TITLE = PD.descOne;
const MODEL = 'profile';
const ROUTE_NAME_NEW = 'admin.profiles.new';
const ROUTE_NAME_DETAIL = 'admin.profiles.profile';
const ROUTE_NAME_INDEX = 'admin.profiles.index';
const ID_ONE = PD.idOne;
const ID_TWO = PD.idTwo;
const ID_GRID_TWO = PD.idGridTwo;
const EDIT_FIELD_CSS_CLASS = '.t-ap-description';
const EDIT_FIELD_VALUE = PD.descTwo;

// Fixed
const LIST_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new/1';
const NEW_URL_2 = BASE_URL + '/new/2';
const DETAIL_URL = BASE_URL + '/' + PD.idOne;


let application, store, list_xhr, detail_data, endpoint, detail_xhr, detail_data_two, list_data, counter;

moduleForAcceptance('Acceptance | tab profile test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    // Edit based on module
    detail_data = PF.detail(ID_ONE);
    detail_xhr = xhr(`${API_LIST_URL}${ID_ONE}/`, 'GET', null, {}, 200, detail_data);
    detail_data_two = PF.detail(ID_GRID_TWO);
    list_data = PF.list();
  }
});

test('(NEW URL) deep linking the new profile url should push a tab into the tab store with correct properties', assert => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = tabs.objectAt(0);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE_NAME);
    assert.equal(tab.get('module'), MODEL);
    assert.equal(tab.get('routeName'), ROUTE_NAME_NEW);
    assert.equal(tab.get('redirectRoute'), ROUTE_NAME_INDEX);
    assert.equal(tab.get('newModel'), true);
  });
});

test('deep linking the profile detail url should push a tab into the tab store with correct properties', assert => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', ID_ONE);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
    assert.equal(tab.get('module'), MODEL);
    assert.equal(tab.get('routeName'), ROUTE_NAME_DETAIL);
    assert.equal(tab.get('redirectRoute'), ROUTE_NAME_INDEX);
    assert.equal(tab.get('newModel'), false);
  });
});

test('visiting the profile detail url from the list url should push a tab into the tab store', assert => {
  list_xhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, list_data);
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', ID_ONE);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
    assert.equal(tab.get('module'), MODEL);
    assert.equal(tab.get('routeName'), ROUTE_NAME_DETAIL);
    assert.equal(tab.get('redirectRoute'), ROUTE_NAME_INDEX);
    assert.equal(tab.get('newModel'), false);
  });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', assert => {
  list_xhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, list_data);
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let model = store.find(MODEL, ID_ONE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), false);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
  });
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let model = store.find(MODEL, ID_ONE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a new model from the grid view will not dirty the original tab', assert => {
  list_xhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, list_data);
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let model = store.find(MODEL, ID_ONE);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
  detail_xhr = xhr(`${API_LIST_URL}${ID_GRID_TWO}/`, 'GET', null, {}, 200, detail_data_two);
  click('.t-grid-data:eq(2)');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_URL}/${ID_GRID_TWO}`);
    let model = store.find(MODEL, ID_ONE);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
    let obj_two = store.find(MODEL, ID_GRID_TWO);
    assert.ok(obj_two.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('(NEW URL) clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', assert => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE_NAME);
  });
  list_xhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, list_data);
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
});

test('(NEW URL) clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', assert => {
  random.uuid = function() { return UUID.value; };
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE_NAME);
  });
  fillIn(EDIT_FIELD_CSS_CLASS, EDIT_FIELD_VALUE);
  list_xhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, list_data);
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let model = store.find(MODEL, UUID.value);
    assert.equal(model.get('description'), EDIT_FIELD_VALUE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), true);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let model = store.find(MODEL, UUID.value);
    assert.equal(model.get('description'), EDIT_FIELD_VALUE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), true);
  });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', assert => {
  list_xhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, list_data);
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  fillIn(EDIT_FIELD_CSS_CLASS, EDIT_FIELD_VALUE);
  andThen(() => {
    let model = store.find(MODEL, ID_ONE);
    assert.equal(model.get('description'), EDIT_FIELD_VALUE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), EDIT_FIELD_VALUE);
  });
  andThen(() => {
    visit(LIST_URL);
    andThen(() => {
      assert.equal(currentURL(), LIST_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let model = store.find(MODEL, ID_ONE);
    assert.equal(model.get('description'), EDIT_FIELD_VALUE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('a dirty model should add the dirty class to the tab close icon', assert => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.dirty').length, 0);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
  });
  fillIn(EDIT_FIELD_CSS_CLASS, EDIT_FIELD_VALUE);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
});

test('closing a document should close it\'s related tab', assert => {
  list_xhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
    click('.t-cancel-btn:eq(0)');
    andThen(() => {
      assert.equal(tabs.get('length'), 0);
    });
  });
});

test('opening a new tab, navigating away and closing the tab should remove the tab', assert => {
  clearxhr(detail_xhr);
  list_xhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, list_data);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE_NAME);
    visit(LIST_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, navigating away and closing the tab should remove the tab', assert => {
  list_xhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
    visit(LIST_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', assert => {
  list_xhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
  });
  fillIn(EDIT_FIELD_CSS_CLASS, EDIT_FIELD_VALUE);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), EDIT_FIELD_VALUE);
  });
  visit(LIST_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    waitFor(assert, () => {
      assert.equal(find('.t-modal-body').length, 1);
    });
  });
});

test('(NEW URL) clicking on the new link with a new tab of the same type open will redirect to open tab', assert => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE_NAME);
  });
  fillIn(EDIT_FIELD_CSS_CLASS, EDIT_FIELD_VALUE);
  xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, list_data);
  generalPage.clickAssignmentProfiles();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
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
