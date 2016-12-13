import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import CF from 'bsrs-ember/vendor/category_fixtures';
import RF from 'bsrs-ember/vendor/role_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';
import BASEURLS, { PREFIX, ROLE_LIST_URL } from 'bsrs-ember/utilities/urls';

const BASE_CATEGORY_URL = BASEURLS.base_categories_url;
const CATEGORY_URL = BASE_CATEGORY_URL + '/index';
const NEW_URL = BASE_CATEGORY_URL + '/new/1';
const NEW_URL_2 = BASE_CATEGORY_URL + '/new/2';
const DETAIL_URL = BASE_CATEGORY_URL + '/' + CD.idGridOne;
const NEW_ROUTE = 'admin.categories.new';
const INDEX_ROUTE = 'admin.categories.index';
const DETAIL_ROUTE = 'admin.categories.category';
const DOC_TYPE = 'category';

let application, list_xhr, category_detail_data, endpoint, detail_xhr;

moduleForAcceptance('Acceptance | tab category test', {
  beforeEach() {
    endpoint = PREFIX + BASE_CATEGORY_URL + '/';
    category_detail_data = CF.detail(CD.idGridOne);
    detail_xhr = xhr(endpoint + CD.idGridOne + '/', 'GET', null, {}, 200, category_detail_data);
  },
});

test('(NEW URL) deep linking the new category url should push a tab into the tab store with correct properties', function(assert) {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = tabs.objectAt(0);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Category');
    assert.equal(tab.get('module'), 'category');
    assert.equal(tab.get('routeName'), NEW_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), true);
  });
});

test('deep linking the category detail url should push a tab into the tab store with correct properties', function(assert) {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = this.store.find('tab', CD.idGridOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), CD.nameOne);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('visiting the category detail url from the list url should push a tab into the tab store', function(assert) {
  let category_list_data = CF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
  visit(CATEGORY_URL);
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = this.store.find('tab', CD.idGridOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), CD.nameOne);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', function(assert) {
  let category_list_data = CF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
  visit(CATEGORY_URL);
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let category = this.store.find('category', CD.idGridOne);
    assert.equal(category.get('isDirtyOrRelatedDirty'), false);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), CD.nameOne);
  });
  visit(CATEGORY_URL);
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let category = this.store.find('category', CD.idGridOne);
    assert.equal(category.get('isDirtyOrRelatedDirty'), false);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Category');
  });
  let category_list_data = CF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
  visit(CATEGORY_URL);
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
});

// test('(NEW URL) clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', function(assert) {
//   random.uuid = function() { return UUID.value; };
//   clearxhr(detail_xhr);
//   visit(NEW_URL);
//   andThen(() => {
//     assert.equal(currentURL(), NEW_URL);
//     let tabs = this.store.find('tab');
//     assert.equal(tabs.get('length'), 1);
//     assert.equal(find('.t-tab-title:eq(0)').text(), 'New Category');
//   });
//   fillIn('.t-category-name', CD.nameTwo);
//   let category_list_data = CF.list();
//   list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
//   visit(CATEGORY_URL);
//   andThen(() => {
//     assert.equal(currentURL(), CATEGORY_URL);
//     let category = this.store.find('category', UUID.value);
//     assert.equal(category.get('name'), CD.nameTwo);
//     assert.equal(category.get('isDirtyOrRelatedDirty'), true);
//   });
//   click('.t-tab:eq(0)');
//   andThen(() => {
//     assert.equal(currentURL(), NEW_URL);
//     let category = this.store.find('category', UUID.value);
//     assert.equal(category.get('name'), CD.nameTwo);
//     assert.equal(category.get('isDirtyOrRelatedDirty'), true);
//   });
// });

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', function(assert) {
  let category_list_data = CF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
  visit(CATEGORY_URL);
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  fillIn('.t-category-name', CD.nameTwo);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let category = this.store.find('category', CD.idGridOne);
    assert.equal(category.get('name'), CD.nameTwo);
    assert.equal(category.get('isDirtyOrRelatedDirty'), true);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), CD.nameTwo);
  });
  andThen(() => {
    visit(CATEGORY_URL);
    andThen(() => {
      assert.equal(currentURL(), CATEGORY_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let category = this.store.find('category', CD.idGridOne);
    assert.equal(category.get('name'), CD.nameTwo);
    assert.equal(category.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is dirty from the role url (or any non related page) should take you to the detail url and not fire off an xhr request', function(assert) {
  let category_list_data = CF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
  visit(CATEGORY_URL);
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  fillIn('.t-category-name', CD.nameTwo);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let category = this.store.find('category', CD.idGridOne);
    assert.equal(category.get('name'), CD.nameTwo);
    assert.equal(category.get('isDirtyOrRelatedDirty'), true);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), CD.nameTwo);
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
    let category = this.store.find('category', CD.idGridOne);
    assert.equal(category.get('name'), CD.nameTwo);
    assert.equal(category.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is not dirty from the role url (or any non related page) should take you to the detail url and fire off an xhr request', function(assert) {
  xhr(endpoint + '?page=1','GET',null,{},200,CF.list());
  visit(CATEGORY_URL);
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let category = this.store.find('category', CD.idGridOne);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), CD.nameOne);
  });
  let role_endpoint = PREFIX + ROLE_LIST_URL + '/';
  xhr(role_endpoint + '?page=1','GET',null,{},200, RF.list());
  click('.t-nav-admin-role');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let category = this.store.find('category', CD.idGridOne);
    assert.equal(category.get('isDirtyOrRelatedDirty'), false);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), CD.nameOne);
  });
  fillIn('.t-category-name', CD.nameTwo);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
});

test('closing a document should close it\'s related tab', function(assert) {
  let category_list_data = CF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), CD.nameOne);
  });
  click('.t-cancel-btn:eq(0)');
  andThen(() => {
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('(NEW URL) closing a document should close it\'s related tab', function(assert) {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(tabs.objectAt(0).get('previousLocation'), undefined);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Category');
  });
  xhr(endpoint + '?page=1', 'GET', null, {}, 200, CF.list());
  click('.t-cancel-btn:eq(0)');
  andThen(() => {
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('(NEW URL) opening a new tab, navigating away and closing the tab should remove the tab', function(assert) {
  clearxhr(detail_xhr);
  let category_list_data = CF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Category');
  });
  visit(CATEGORY_URL);
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.objectAt(0).get('previousLocation'), 'admin.categories.new');
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('(NEW URL) opening a new tab, navigating to a diff module and closing the tab should remove the tab', function(assert) {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Category');
  });
  xhr(`${PREFIX}${ROLE_LIST_URL}/?page=1`,'GET',null,{},200,RF.list());
  visit(ROLE_LIST_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, navigating away and closing the tab should remove the tab', function(assert) {
  let category_list_data = CF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), CD.nameOne);
    visit(CATEGORY_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', function(assert) {
  let category_list_data = CF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), CD.nameOne);
  });
  fillIn('.t-category-name', CD.nameTwo);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), `${CD.nameTwo}`);
  });
  visit(CATEGORY_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Category');
  });
  fillIn('.t-category-name', CD.nameTwo);
  let category_list_data = CF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
  generalPage.clickCategories();
  andThen(() => {
    assert.equal(currentURL(), CATEGORY_URL);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL_2);
    let tabs = this.store.find('tab');
    assert.equal(tabs.get('length'), 2);
  });
});
