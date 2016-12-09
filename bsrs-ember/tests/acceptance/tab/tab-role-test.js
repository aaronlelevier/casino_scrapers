import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import RF from 'bsrs-ember/vendor/role_fixtures';
import RD from 'bsrs-ember/vendor/defaults/role';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import CF from 'bsrs-ember/vendor/category_fixtures';
import random from 'bsrs-ember/models/random';
import { roleNewData } from 'bsrs-ember/tests/helpers/payloads/role';
import page from 'bsrs-ember/tests/pages/role';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { PREFIX, ROLE_LIST_URL } from 'bsrs-ember/utilities/urls';

const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const NEW_URL = ROLE_LIST_URL + '/new/1';
const NEW_URL_2 = ROLE_LIST_URL + '/new/2';
const DETAIL_URL = ROLE_LIST_URL + '/' + RD.idGridOne;
const PEOPLE_URL = BASE_PEOPLE_URL + '/index';
const NEW_ROUTE = 'admin.roles.index.new';
const INDEX_ROUTE = 'admin.roles.index';
const DETAIL_ROUTE = 'admin.roles.index.role';
const DOC_TYPE = 'role';

let application, store, list_xhr, role_detail_data, endpoint, detail_xhr, run = Ember.run;

moduleForAcceptance('Acceptance | tab role test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + ROLE_LIST_URL + '/';
    role_detail_data = RF.detail(RD.idGridOne, RD.nameGrid);
    detail_xhr = xhr(endpoint + RD.idGridOne + '/', 'GET', null, {}, 200, role_detail_data);
    run(() => {
      store.push('role', {id: RD.idGridOne, name: 'wat', categories: [CF.detail()]});
    });
    // Settings
    let setting_endpoint = `${PREFIX}${ROLE_LIST_URL}/route-data/new/`;
    xhr(setting_endpoint, 'GET', null, {}, 200, roleNewData);
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, RF.list());
  },
});

test('(NEW URL) deep linking the new role url should push a tab into the tab store with correct properties', (assert) => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = tabs.objectAt(0);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Role');
    assert.equal(tab.get('module'), 'role');
    assert.equal(tab.get('routeName'), NEW_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), true);
  });
});

test('deep linking the role detail url should push a tab into the tab store with correct properties', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', RD.idGridOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameGrid);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('visiting the role detail url from the list url should push a tab into the tab store', (assert) => {
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
    const role = store.find('role-list', RD.idGridOne);
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  });
  click('.t-grid-data:eq(3)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', RD.idGridOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameGrid);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(3)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let role = store.find('role', RD.idGridOne);
    assert.equal(role.get('isDirtyOrRelatedDirty'), false);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameGrid);
  });
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let role = store.find('role', RD.idGridOne);
    // assert.equal(role.get('isDirtyOrRelatedDirty'), false);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Role');
  });
  let role_list_data = RF.list();
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Role');
  });
  page.nameFill(RD.nameTwo);
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    let role = store.find('role', UUID.value);//sensitive to changes in number of roles that are bootstrapped.  Bc remove uuid = 'abc123' for new model, need to find specific one
    assert.equal(role.get('name'), RD.nameTwo);
    assert.ok(role.get('isDirtyOrRelatedDirty'));
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let role = store.find('role', UUID.value);
    assert.equal(role.get('name'), RD.nameTwo);
    assert.equal(role.get('isDirtyOrRelatedDirty'), true);
  });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(3)');
  page.nameFill(RD.nameTwo);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let role = store.find('role', RD.idGridOne);
    assert.equal(role.get('name'), RD.nameTwo);
    assert.equal(role.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameTwo);
  });
  andThen(() => {
    visit(ROLE_LIST_URL);
    andThen(() => {
      assert.equal(currentURL(), ROLE_LIST_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let role = store.find('role', RD.idGridOne);
    assert.equal(role.get('name'), RD.nameTwo);
    assert.equal(role.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is dirty from the role url (or any non related page) should take you to the detail url and not fire off an xhr request', (assert) => {
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(3)');
  page.nameFill(RD.nameTwo);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let role = store.find('role', RD.idGridOne);
    assert.equal(role.get('name'), RD.nameTwo);
    assert.equal(role.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameTwo);
  });
  click('.t-nav-admin-role');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let role = store.find('role', RD.idGridOne);
    assert.equal(role.get('name'), RD.nameTwo);
    assert.equal(role.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is not dirty from the people url (or any non related page) should take you to the detail url and fire off an xhr request', (assert) => {
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(3)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let role = store.find('role', RD.idGridOne);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameGrid);
  });
  let people_list_data = PF.list();
  let people_endpoint = PREFIX + BASE_PEOPLE_URL + '/';
  xhr(people_endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let role = store.find('role', RD.idGridOne);
    assert.equal(role.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('a dirty model should add the dirty class to the tab close icon', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.dirty').length, 0);
    let tabs = store.find('tab');
    assert.equal(find('[data-test-id="tabs"] .dirty').length, 0);
    assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameGrid);
  });
  page.nameFill(RD.nameTwo);
  andThen(() => {
    assert.equal(find('[data-test-id="tabs"] .dirty').length, 1);
  });
});

test('closing a document should close it\'s related tab', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameGrid);
  });
  click('.t-cancel-btn:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a new tab, navigating away and closing the tab should remove the tab', (assert) => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Role');
    visit(ROLE_LIST_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, navigating away and closing the tab should remove the tab', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameGrid);
    visit(ROLE_LIST_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameGrid);
  });
  page.nameFill(RD.nameTwo);
  andThen(() => {
    assert.equal(find('[data-test-id="tabs"] .dirty').length, 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), `${RD.nameTwo}`);
  });
  visit(ROLE_LIST_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    waitFor(assert, () => {
      assert.equal(find('.t-modal-body').length, 1);
    });
  });
});

test('(NEW URL) clicking on the new link with a new tab of the same type open will redirect to open tab', (assert) => {
  random.uuid = function() { return UUID.value; };
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Role');
  });
  generalPage.clickRoles();
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL_2);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
});
