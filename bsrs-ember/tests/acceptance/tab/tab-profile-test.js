
import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import PD from 'bsrs-ember/vendor/defaults/profile';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_profile_url;
const LIST_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new/1';
const NEW_URL_2 = BASE_URL + '/new/2';
const DETAIL_URL = BASE_URL + '/' + PD.idOne;

let application, store, list_xhr, detail_data, endpoint, detail_xhr, original_uuid, counter;

module('Acceptance | tab profile test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = `${PREFIX}/profiles/assignment/`;
    detail_data = PF.detail(PD.idOne);
    detail_xhr = xhr(`${endpoint}${PD.idOne}/`, 'GET', null, {}, 200, detail_data);
    original_uuid = random.uuid;
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
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
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Profile');
    assert.equal(tab.get('module'), 'profile');
    assert.equal(tab.get('routeName'), 'admin.profiles.new');
    assert.equal(tab.get('redirectRoute'), 'admin.profiles.index');
    assert.equal(tab.get('newModel'), true);
  });
});

test('deep linking the profile detail url should push a tab into the tab store with correct properties', assert => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', PD.idOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.descOne);
    assert.equal(tab.get('module'), 'profile');
    assert.equal(tab.get('routeName'), 'admin.profiles.profile');
    assert.equal(tab.get('redirectRoute'), 'admin.profiles.index');
    assert.equal(tab.get('newModel'), false);
  });
});

test('visiting the profile detail url from the list url should push a tab into the tab store', assert => {
  let profile_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, profile_list_data);
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
    let tab = store.find('tab', PD.idOne);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.descOne);
    assert.equal(tab.get('module'), 'profile');
    assert.equal(tab.get('routeName'), 'admin.profiles.profile');
    assert.equal(tab.get('redirectRoute'), 'admin.profiles.index');
    assert.equal(tab.get('newModel'), false);
  });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', assert => {
  let profile_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, profile_list_data);
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let profile = store.find('profile', PD.idOne);
    assert.equal(profile.get('isDirtyOrRelatedDirty'), false);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.descOne);
  });
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let profile = store.find('profile', PD.idOne);
    assert.equal(profile.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a new model from the grid view will not dirty the original tab', assert => {
  let profile_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, profile_list_data);
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  click('.t-grid-data:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let profile = store.find('profile', PD.idOne);
    assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  });
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
  const secondId = '1ee82b8c-89bd-45a2-8d57-5b920c8b0002';
  const donald_detail_data = PF.detail(secondId);
  detail_xhr = xhr(`${endpoint}${secondId}/`, 'GET', null, {}, 200, donald_detail_data);
  click('.t-grid-data:eq(2)');
  andThen(() => {
    assert.equal(currentURL(), `/admin/profiles/${secondId}`);
    let profile = store.find('profile', PD.idOne);
    assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
    let profile_two = store.find('profile', secondId);
    assert.ok(profile_two.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('(NEW URL) clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', assert => {
  clearxhr(detail_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Profile');
  });
  let profile_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, profile_list_data);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Profile');
  });
  fillIn('.t-ap-description', PD.descTwo);
  let profile_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, profile_list_data);
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let profile = store.find('profile', UUID.value);
    assert.equal(profile.get('description'), PD.descTwo);
    assert.equal(profile.get('isDirtyOrRelatedDirty'), true);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let profile = store.find('profile', UUID.value);
    assert.equal(profile.get('description'), PD.descTwo);
    assert.equal(profile.get('isDirtyOrRelatedDirty'), true);
  });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', assert => {
  let profile_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, profile_list_data);
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
  fillIn('.t-ap-description', PD.descTwo);
  andThen(() => {
    let profile = store.find('profile', PD.idOne);
    assert.equal(profile.get('description'), PD.descTwo);
    assert.equal(profile.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.descTwo);
  });
  andThen(() => {
    visit(LIST_URL);
    andThen(() => {
      assert.equal(currentURL(), LIST_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let profile = store.find('profile', PD.idOne);
    assert.equal(profile.get('description'), PD.descTwo);
    assert.equal(profile.get('isDirtyOrRelatedDirty'), true);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.descOne);
  });
  fillIn('.t-ap-description', PD.descTwo);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
});

test('closing a document should close it\'s related tab', assert => {
  let profile_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, profile_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.descOne);
    click('.t-cancel-btn:eq(0)');
    andThen(() => {
      assert.equal(tabs.get('length'), 0);
    });
  });
});

test('opening a new tab, navigating away and closing the tab should remove the tab', assert => {
  clearxhr(detail_xhr);
  let profile_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, profile_list_data);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Profile');
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
  let profile_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, profile_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.descOne);
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
  let profile_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, profile_list_data);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.descOne);
  });
  fillIn('.t-ap-description', PD.descTwo);
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
    assert.equal(find('.t-tab-title:eq(0)').text(), PD.descTwo);
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
    assert.equal(find('.t-tab-title:eq(0)').text(), 'New Profile');
  });
  fillIn('.t-ap-description', PD.descTwo);
  let profile_list_data = PF.list();
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, profile_list_data);
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL_2);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
});
