import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import BASEURLS from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const PREFIX = config.APP.NAMESPACE;
const BASE_ADMIN_URL = 'admin';
const BASE_SETTINGS_URL = BASEURLS.base_setting_url;
const DETAIL_URL = BASE_SETTINGS_URL + '/' + TD.id;
const DETAIL_ROUTE = 'admin.settings';
const DOC_TYPE = 'tenant';
const general_settings_link = '.t-nav-general-settings:eq(0)';

let application, store, settings_data, endpoint, detail_xhr;

moduleForAcceptance('Acceptance | tab general settings (tenant) test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_SETTINGS_URL + '/';
    settings_data = TF.detail();
    detail_xhr = xhr(`${PREFIX}/admin/tenant/${TD.id}/`, 'GET', null, {}, 200, settings_data);
  },
});

test('deep linking the settings detail url should push a tab into the tab store with correct properties', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', TD.id);
    assert.equal(find('.t-tab-title:eq(0)').text(), t('admin.general.other'));
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), BASE_ADMIN_URL);
    assert.equal(tab.get('newModel'), false);
  });
});

test('visiting the setting detail url from the admin url should push a tab into the tab store', (assert) => {
  visit(BASE_ADMIN_URL);
  andThen(() => {
    assert.equal(currentURL(), BASE_ADMIN_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  generalPage.clickGeneralSettingsLink();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
    let tab = store.find('tab', TD.id);
    assert.equal(tab.get('module'), DOC_TYPE);
    assert.equal(tab.get('routeName'), DETAIL_ROUTE);
    assert.equal(tab.get('redirectRoute'), BASE_ADMIN_URL);
    assert.equal(tab.get('newModel'), false);
  });
});

test('clicking on a tab that is not dirty from the admin url should take you to the detail url and not fire off an xhr request', (assert) => {
  visit(BASE_ADMIN_URL);
  andThen(() => {
    assert.equal(currentURL(), BASE_ADMIN_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  generalPage.clickGeneralSettingsLink();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tenant = store.find('tenant', TD.id);
    assert.equal(tenant.get('isDirtyOrRelatedDirty'), false);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  visit(BASE_ADMIN_URL);
  andThen(() => {
    assert.equal(currentURL(), BASE_ADMIN_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let tenant = store.find('tenant', TD.id);
    assert.equal(tenant.get('isDirtyOrRelatedDirty'), false);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is dirty from the admin url should take you to the detail url and not fire off an xhr request', (assert) => {
  visit(BASE_ADMIN_URL);
  andThen(() => {
    assert.equal(currentURL(), BASE_ADMIN_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  generalPage.clickGeneralSettingsLink();
  fillIn('.t-settings-dashboard_text:eq(0)', '1234');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tenant = store.find('tenant', TD.id);
    assert.equal(tenant.get('name'), TD.name);
    assert.equal(tenant.get('isDirtyOrRelatedDirty'), true);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  andThen(() => {
    visit(BASE_ADMIN_URL);
    andThen(() => {
      assert.equal(currentURL(), BASE_ADMIN_URL);
    });
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let tenant = store.find('tenant', TD.id);
    assert.equal(tenant.get('name'), TD.name);
    assert.equal(tenant.get('isDirtyOrRelatedDirty'), true);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('clicking on a tab that is not dirty from the role url (or any non related page) should take you to the detail url and fire off an xhr request', (assert) => {
  visit(BASE_ADMIN_URL);
  andThen(() => {
    assert.equal(currentURL(), BASE_ADMIN_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 0);
  });
  generalPage.clickGeneralSettingsLink();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tenant = store.find('tenant', TD.id);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  click('.t-nav-admin');
  andThen(() => {
    assert.equal(currentURL(), '/' + BASE_ADMIN_URL);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    let tenant = store.find('tenant', TD.id);
    assert.equal(tenant.get('isDirtyOrRelatedDirty'), false);
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
  });
  fillIn('.t-settings-dashboard_text:eq(0)', '1234');
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
});

test('closing a document should close it\'s related tab', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let tabs = store.find('tab');
    assert.equal(tabs.get('length'), 1);
  });
  click('.t-cancel-btn:eq(0)');
  andThen(() => {
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
    visit(BASE_ADMIN_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), BASE_ADMIN_URL);
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
  });
  fillIn('.t-settings-dashboard_text:eq(0)', '1234');
  andThen(() => {
    assert.equal(find('.dirty').length, 1);
  });
  visit(BASE_ADMIN_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), BASE_ADMIN_URL);
    waitFor(assert, () => {
      assert.equal(find('.t-modal-body').length, 1);
    });
  });
});
