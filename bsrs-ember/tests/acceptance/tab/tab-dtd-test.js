import Ember from 'ember'; import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import RF from 'bsrs-ember/vendor/role_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';

const PREFIX = config.APP.NAMESPACE;
const BASE_DTD_URL = BASEURLS.base_dtd_url;
const BASE_ROLE_URL = BASEURLS.base_roles_url;
const DTD_URL = BASE_DTD_URL;
const ADMIN_URL = BASEURLS.base_admin_url;
const NEW_URL = `${BASE_DTD_URL}/new/1`;
const NEW_URL_2 = `${BASE_DTD_URL}/new/2`;
const DETAIL_URL = `${BASE_DTD_URL}/${DTD.idOne}`;
const ROLE_URL = `${BASE_ROLE_URL}/index`;
const NEW_ROUTE = 'dtds.new';
const INDEX_ROUTE = 'dtds';
const DETAIL_ROUTE = 'dtds.dtd';
const DOC_TYPE = 'dtd';
const TAB_TITLE = '.t-tab-title:eq(0)';
const DTD_TAB_NAME = 'Decision Tree';

let application, store, list_xhr, dtd_detail_data, endpoint, detail_xhr, original_uuid;

module('Acceptance | tab dtd test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = `${PREFIX}${BASE_DTD_URL}/`;
    dtd_detail_data = DTDF.detail(DTD.idOne);
    detail_xhr = xhr(`${endpoint}${DTD.idOne}/`, 'GET', null, {}, 200, dtd_detail_data);
    list_xhr = xhr(`${PREFIX}${DTD_URL}/?page=1`, 'GET', null, {}, 201, DTDF.list());
    original_uuid = random.uuid;
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

test('going from admin to dtds list view generates a tab', assert => {
  clearxhr(detail_xhr);
  visit(ADMIN_URL);
  andThen(() => {
    assert.equal(currentURL(), ADMIN_URL);
  });
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), BASE_DTD_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = tabs.objectAt(0);
    assert.equal(find(TAB_TITLE).text(), DTD_TAB_NAME);
    assert.equal(tab.get('module'), DOC_TYPE);
  });
});

test('deep link to dtd list view generates a tab', assert => {
  clearxhr(detail_xhr);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), BASE_DTD_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = tabs.objectAt(0);
    assert.equal(find(TAB_TITLE).text(), DTD_TAB_NAME);
    assert.equal(tab.get('module'), DOC_TYPE);
  });
});

// test('(NEW URL) deep linking the new dtd url should push a tab into the tab store with correct properties', (assert) => {
//   clearxhr(detail_xhr);
//   page.visitNew();
//   andThen(() => {
//     assert.equal(currentURL(), NEW_URL);
//     let tabs = store.find('tab');
//     assert.equal(tabs.get('length'), 1);
//     let tab = tabs.objectAt(0);
//     assert.equal(find(TAB_TITLE).text(), DTD_TAB_NAME);
//     assert.equal(tab.get('module'), 'dtd');
//     assert.equal(tab.get('routeName'), NEW_ROUTE);
//     assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
//     // assert.equal(tab.get('newModel'), true);
//   });
// });

// test('deep linking the dtd detail url should push a tab into the tab store with correct properties', (assert) => {
//   page.visitDetail();
//   andThen(() => {
//     assert.equal(currentURL(), DETAIL_URL);
//     let tabs = store.find('tab');
//     assert.equal(tabs.get('length'), 1);
//     const tab = store.findOne('tab');
//     const dtd = store.findOne('dtd');
//     assert.equal(find(TAB_TITLE).text(), DTD_TAB_NAME);
//     assert.equal(tab.get('module'), DOC_TYPE);
//     assert.equal(tab.get('routeName'), DETAIL_ROUTE);
//     assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
//     // assert.equal(tab.get('newModel'), false);
//   });
// });

test('visiting the dtd list, then detail url there will only be one dtd tab', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    const tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    const tab = store.findOne('tab');
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and fire off an xhr request', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let dtd = store.find('dtd', DTD.idOne);
    assert.ok(dtd.get('isNotDirty'));
    assert.equal(dtd.get('links').objectAt(0).get('isDirtyOrRelatedDirty'), false);
    assert.ok(dtd.get('linksIsNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let dtd = store.find('dtd', DTD.idOne);
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('(NEW URL) clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  random.uuid = function() { return UUID.value; };
  clearxhr(detail_xhr);
  page.visitNew();
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    const dtds = store.find('dtd-list');
    assert.equal(dtds.get('length'), 10);
    assert.equal(tabs.get('length'), 1);
    assert.equal(find(TAB_TITLE).text(), DTD_TAB_NAME);
  });
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    const dtds = store.find('dtd');
    assert.equal(dtds.get('length'), 1);
  });
});

test('(NEW URL) clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  random.uuid = function() { return UUID.value; };
  clearxhr(detail_xhr);
  page.visitNew();
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find(TAB_TITLE).text(), DTD_TAB_NAME);
  });
  page.descriptionFillIn(DTD.descriptionTwo);
  andThen(() => {
    let dtd = store.findOne('dtd');
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  });
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    let dtd = store.find('dtd').objectAt(0);
    assert.equal(dtd.get('description'), DTD.descriptionTwo);
    assert.equal(dtd.get('isDirtyOrRelatedDirty'), true);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let dtd = store.find('dtd').objectAt(0);
    assert.equal(page.description, DTD.descriptionTwo);
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    const tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  click('.t-grid-data:eq(0)');
  page.descriptionFillIn(DTD.descriptionTwo);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    const dtd = store.findOne('dtd');
    assert.equal(page.priorityInput, DTD.priorityTwo);
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    const tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.ok(generalPage.isDirty);
  });
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
  });
  click('.t-dtd-description:eq(0)'); // 1st item in dtd list
  andThen(() => {
    const dtd = store.findOne('dtd');
    assert.equal(page.description, DTD.descriptionTwo);
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is dirty from the role url (or any non related page) should take you to the detail url and not fire off an xhr request', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  click('.t-grid-data:eq(0)');
  page.keyFillIn(DTD.keyTwo);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let dtd = store.find('dtd', DTD.idOne);
    assert.equal(page.key, DTD.keyTwo);
    assert.equal(dtd.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  let endpoint = `${PREFIX}${BASE_ROLE_URL}/`;
  xhr(endpoint + '?page=1','GET',null,{},200,RF.list());
  visit(ROLE_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
    let dtd = store.find('dtd', DTD.idOne);
    assert.equal(dtd.get('isDirtyOrRelatedDirty'), true);
    assert.equal(dtd.get('isNotDirtyOrRelatedNotDirty'), false);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let dtd = store.find('dtd', DTD.idOne);
    assert.equal(dtd.get('key'), DTD.keyTwo);
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is not dirty from the role url (or any non related page) should take you to the detail url and fire off an xhr request', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let dtd = store.find('dtd', DTD.idOne);
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
    let dtd = store.find('dtd', DTD.idOne);
    assert.equal(dtd.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('a dirty model should add the dirty class to the tab close icon and the grid', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('tr .dirty').length, 0);
    assert.equal(find('.t-tab-close > i.dirty').length, 0);
    const tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  page.keyFillIn(DTD.keyTwo);
  andThen(() => {
    assert.equal(find('tr .dirty').length, 1);
    assert.ok(generalPage.isDirty);
  });
});

test('clicking cancel on a not dirty model should not close tab', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    const tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    const tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
});

test('opening a tab, making the model dirty and closing the tab should display the confirm dialog', (assert) => {
  visit(DETAIL_URL);
  page.keyFillIn(DTD.keyTwo);
  andThen(() => {
    assert.ok(generalPage.isDirty);
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    waitFor(assert, () => { 
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      let tabs = store.find('tab');
      assert.equal(tabs.get('length'), 1);
      assert.equal(currentURL(), DETAIL_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

//test('(NEW) opening a new tab, navigating away and closing the tab should remove the tab and stay on that url', (assert) => {
//  clearxhr(detail_xhr);
//  page.visitNew();
//  andThen(() => {
//    assert.equal(currentURL(), NEW_URL);
//    let tabs = store.find('tab');
//    assert.equal(tabs.get('length'), 1);
//  });
//  page.visit();
//  click('.t-tab-close:eq(0)');
//  andThen(() => {
//    // assert.equal(currentURL(), INDEX_ROUTE);
//    let tabs = store.find('tab');
//    assert.equal(tabs.get('length'), 0);
//    //TODO: this test should work
//    // assert.equal(page.emptyDetailHint, '');
//  });
//});

test('opening a tab and closing the tab should remove the tab from the store', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), ADMIN_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, making the model dirty and closing the tab should display the confirm dialog', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  page.keyFillIn(DTD.keyTwo);
  andThen(() => {
    assert.ok(generalPage.isDirty);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    waitFor(assert, () => { //TODO: leave in if animations are added to modal.  Otherwise waitFor is not needed
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.close_tab'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
});

test('trying to close the tab with one of the dirty dtds that are dirty will show modal', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  page.keyFillIn(DTD.keyTwo);
  andThen(() => {
    assert.equal(find('tr .dirty').length, 1);
    assert.ok(generalPage.isDirty);
  });
  let dtd_detail_data_2 = DTDF.detail(DTD.idTwo);
  detail_xhr = xhr(`${endpoint}${DTD.idTwo}/`, 'GET', null, {}, 200, dtd_detail_data_2);
  click('.t-grid-data:eq(1)');
  andThen(() => {
    assert.ok(generalPage.isDirty);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    const DETAIL_URL_2 = `${BASE_DTD_URL}/${DTD.idTwo}`;
    assert.equal(currentURL(), DETAIL_URL_2);
    waitFor(assert, () => {
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.close_tab'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), ADMIN_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('(NEW URL) a dirty new tab and clicking on new model button should not push new tab into store', (assert) => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find(TAB_TITLE).text(), DTD_TAB_NAME);
  });
  page.keyFillIn(DTD.keyOne);
  visit(DTD_URL);
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
});

