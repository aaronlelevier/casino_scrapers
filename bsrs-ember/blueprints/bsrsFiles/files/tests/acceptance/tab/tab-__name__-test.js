import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/<%= dasherizedModuleName %>';
import generalPage from 'bsrs-ember/tests/pages/general';
// Edit
import <%= FirstCharacterModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= FirstCharacterModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import BASEURLS, { <%= CapitalizeModule %>_URL, <%= CapitalizeModule %>_LIST_URL } from 'bsrs-ember/utilities/urls';


// Edit based on module
const BASE_URL = BASEURLS.BASE_<%= CapitalizeModule %>_URL;
const TAB_TITLE_NAME = 'New <%= CapFirstLetterModuleName %>';
const TAB_TITLE = <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One;
const MODEL = '<%= dasherizedModuleName %>';
const ROUTE_NAME_NEW = '<%= dasherizedModuleName %>s.new';
const ROUTE_NAME_DETAIL = '<%= dasherizedModuleName %>s.<%= dasherizedModuleName %>';
const ROUTE_NAME_INDEX = '<%= dasherizedModuleName %>s.index';
const ID_ONE = <%= FirstCharacterModuleName %>D.idOne;
const ID_TWO = <%= FirstCharacterModuleName %>D.idTwo;
const ID_GRID_TWO = <%= FirstCharacterModuleName %>D.idGridTwo;
const EDIT_FIELD_VALUE = <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two;

// Fixed
const NEW_URL = BASE_URL + '/new/1';
const NEW_URL_2 = BASE_URL + '/new/2';
const DETAIL_URL = BASE_URL + '/' + <%= FirstCharacterModuleName %>D.idOne;


let store, list_xhr, endpoint, detail_xhr, detail_data_two, list_data;

moduleForAcceptance('Acceptance | tab <%= dasherizedModuleName %> test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    // Edit based on module
    const detail_data = <%= FirstCharacterModuleName %>F.detail(ID_ONE);
    detail_xhr = xhr(`${<%= CapitalizeModule %>_URL}${ID_ONE}/`, 'GET', null, {}, 200, detail_data);
    detail_data_two = <%= FirstCharacterModuleName %>F.detail(ID_GRID_TWO);
    list_data = <%= FirstCharacterModuleName %>F.list();
  },
});

test('(NEW URL) deep linking the new <%= dasherizedModuleName %> url should push a tab into the tab store with correct properties', assert => {
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

test('deep linking the <%= dasherizedModuleName %> detail url should push a tab into the tab store with correct properties', assert => {
  page.visitDetail();
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

test('visiting the <%= dasherizedModuleName %> detail url from the list url should push a tab into the tab store', assert => {
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  generalPage.gridItemZeroClick();
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
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let model = store.find(MODEL, ID_ONE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), false);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
  });
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let model = store.find(MODEL, ID_ONE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a new model from the grid view will not dirty the original tab', assert => {
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let model = store.find(MODEL, ID_ONE);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
  });
  detail_xhr = xhr(`${<%= CapitalizeModule %>_URL}${ID_GRID_TWO}/`, 'GET', null, {}, 200, detail_data_two);
  generalPage.gridItemOneClick();
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
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
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
  page.<%= firstPropertyCamel %>Fill(EDIT_FIELD_VALUE);
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    let model = store.find(MODEL, UUID.value);
    assert.equal(model.get('<%= firstProperty %>'), EDIT_FIELD_VALUE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), true);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let model = store.find(MODEL, UUID.value);
    assert.equal(model.get('<%= firstProperty %>'), EDIT_FIELD_VALUE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), true);
  });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', assert => {
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  page.<%= firstPropertyCamel %>Fill(EDIT_FIELD_VALUE);
  andThen(() => {
    let model = store.find(MODEL, ID_ONE);
    assert.equal(model.get('<%= firstProperty %>'), EDIT_FIELD_VALUE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), EDIT_FIELD_VALUE);
  });
  andThen(() => {
    page.visit();
    andThen(() => {
      assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let model = store.find(MODEL, ID_ONE);
    assert.equal(model.get('<%= firstProperty %>'), EDIT_FIELD_VALUE);
    assert.equal(model.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('a dirty model should add the dirty class to the tab close icon', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.dirty').length, 0);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
  });
  page.<%= firstPropertyCamel %>Fill(EDIT_FIELD_VALUE);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
});

test('closing a document should close it\'s related tab', assert => {
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visitDetail();
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
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE_NAME);
    page.visit();
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, navigating away and closing the tab should remove the tab', assert => {
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
    page.visit();
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', assert => {
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TAB_TITLE);
  });
  page.<%= firstPropertyCamel %>Fill(EDIT_FIELD_VALUE);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), EDIT_FIELD_VALUE);
  });
  page.visit();
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
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
  page.<%= firstPropertyCamel %>Fill(EDIT_FIELD_VALUE);
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
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

test('(NEW URL) clicking on an open new tab will not open a new tab', assert => {
  clearxhr(detail_xhr);
  list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, list_data);
  page.visit();
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  page.visit();
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
});
