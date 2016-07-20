import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import TPF from 'bsrs-ember/vendor/third_party_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import TPD from 'bsrs-ember/vendor/defaults/third-party';
import BASEURLS from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_THIRD_PARTY_URL = BASEURLS.base_third_parties_url;
const THIRD_PARTY_URL = BASE_THIRD_PARTY_URL + '/index';
const NEW_URL = BASE_THIRD_PARTY_URL + '/new/1';
const NEW_URL_2 = BASE_THIRD_PARTY_URL + '/new/2';
const DETAIL_URL = BASE_THIRD_PARTY_URL + '/' + TPD.idOne;
const NEW_ROUTE = 'admin.third-parties.new';
const INDEX_ROUTE = 'admin.third-parties.index';
const DETAIL_ROUTE = 'admin.third-parties.third-party';
const DOC_TYPE = 'third-party';
const BASE_PERSON_URL = BASEURLS.base_people_url;
const PERSON_URL = BASE_PERSON_URL + '/index';

let application, store, list_xhr, third_party_detail_data, endpoint, detail_xhr;

moduleForAcceptance('Acceptance | tab third-party test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_THIRD_PARTY_URL + '/';
    var third_party_detail_data = TPF.detail(TPD.idOne);
    detail_xhr = xhr(endpoint + TPD.idOne + '/', 'GET', null, {}, 200, third_party_detail_data);
  },
});

test('(NEW URL) deep linking the new third-party url should push a tab into the tab store with correct properties', (assert) => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = tabs.objectAt(0);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New ThirdParty');
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), NEW_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), true);
  });
});

test('deep linking the third-party detail url should push a tab into the tab store with correct properties', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', TPD.idOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), TPD.nameOne);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('visiting the third_party detail url from the list url should push a tab into the tab store', (assert) => {
  random.uuid = function() { return UUID.value; };
  let third_party_list_data = TPF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, third_party_list_data);
  visit(THIRD_PARTY_URL);
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', TPD.idOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), TPD.nameOne);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), INDEX_ROUTE);
    assert.equal(tab.get('newModel'), false);
  });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  let list_data = TPF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, list_data);
  visit(THIRD_PARTY_URL);
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let third_party = store.find('third-party', TPD.idOne);
    assert.equal(third_party.get('isDirtyOrRelatedDirty'), false);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    // assert.equal(find('.t-tab-title:eq(0)').text(), TPD.nameOne);    // does smthn in /third-parties/third-party/.. need to change?
  });
  visit(THIRD_PARTY_URL);
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let third_party = store.find('third-party', TPD.idOne);
    assert.equal(third_party.get('isDirtyOrRelatedDirty'), false);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New ThirdParty');
  });
  let list_data = TPF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, list_data);
  visit(THIRD_PARTY_URL);
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New ThirdParty');
  });
  fillIn('.t-third-party-name', TPD.nameTwo);
  let list_data = TPF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, list_data);
  visit(THIRD_PARTY_URL);
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
    let third_party = store.find('third-party', UUID.value);
    assert.equal(third_party.get('name'), TPD.nameTwo);
    assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let third_party = store.find('third-party', UUID.value);
    assert.equal(third_party.get('name'), TPD.nameTwo);
    assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);
  });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  let third_party_list_data = TPF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, third_party_list_data);
  visit(THIRD_PARTY_URL);
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  fillIn('.t-third-party-name', TPD.nameTwo);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let third_party = store.find('third-party', TPD.idOne);
    assert.equal(third_party.get('name'), TPD.nameTwo);
    assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TPD.nameTwo);
  });
  visit(THIRD_PARTY_URL);
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let third_party = store.find('third-party', TPD.idOne);
    assert.equal(third_party.get('name'), TPD.nameTwo); // Not passing
    assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);    // TODO: Is this how it works w/ other Tabs being dirty??
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is dirty from the person url (or any non related page) should take you to the detail url and not fire off an xhr request', (assert) => {
  let third_party_list_data = TPF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, third_party_list_data);
  visit(THIRD_PARTY_URL);
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  fillIn('.t-third-party-name', TPD.nameTwo);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let third_party = store.find('third-party', TPD.idOne);
    assert.equal(third_party.get('name'), TPD.nameTwo);
    assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TPD.nameTwo);
  });
  andThen(() => {
    let endpoint = PREFIX + BASE_PERSON_URL + '/';
    xhr(endpoint+'?page=1', 'GET', null, {}, 200, PF.list());
    visit(PERSON_URL);
    andThen(() => {
      assert.equal(currentURL(), PERSON_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let third_party = store.find('third-party', TPD.idOne);
    assert.equal(third_party.get('name'), TPD.nameTwo);
    assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is not dirty from the person url (or any non related page) should take you to the detail url and fire off an xhr request', (assert) => {
  xhr(endpoint + '?page=1', 'GET', null, {}, 200, TPF.list());
  visit(THIRD_PARTY_URL);
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let third_party = store.find('third-party', TPD.idOne);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TPD.nameOne);
  });
  let person_endpoint = PREFIX + BASE_PERSON_URL + '/';
  xhr(person_endpoint + '?page=1','GET', null, {}, 200, PF.list());
  click('.t-nav-admin-people');
  andThen(() => {
    assert.equal(currentURL(), PERSON_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let third_party = store.find('third-party', TPD.idOne);
    assert.equal(third_party.get('isDirtyOrRelatedDirty'), false);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), TPD.nameOne);
  });
  fillIn('.t-third-party-name', TPD.nameTwo);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
});

test('closing a document should close its related tab', (assert) => {
  let third_party_list_data = TPF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, third_party_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TPD.nameOne);
    click('.t-cancel-btn:eq(0)');
    andThen(() => {
      assert.equal(tabs.get('length'), 0);
    });
  });
});

test('opening a new tab, navigating away and closing the tab should remove the tab', (assert) => {
  clearxhr(detail_xhr);
  let third_party_list_data = TPF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, third_party_list_data);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New ThirdParty');
    visit(THIRD_PARTY_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, navigating away and closing the tab should remove the tab', (assert) => {
  let third_party_list_data = TPF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, third_party_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TPD.nameOne);
    visit(THIRD_PARTY_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', (assert) => {
  let third_party_list_data = TPF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, third_party_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), TPD.nameOne);
  });
  fillIn('.t-third-party-name', TPD.nameTwo);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), `${TPD.nameTwo}`);
  });
  visit(THIRD_PARTY_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
    waitFor(assert, () => {
      assert.equal(find('.t-modal-body').length, 1);
    });
  });
});

test('(NEW URL) clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New ThirdParty');
  });
  fillIn('.t-third-party-name', TPD.nameTwo);
  let list_data = TPF.list();
  xhr(endpoint + '?page=1', 'GET', null, {}, 200, list_data);
  visit(THIRD_PARTY_URL);
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL_2);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 2);
  });
});
