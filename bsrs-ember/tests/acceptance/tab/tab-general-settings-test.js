import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';

import SF from 'bsrs-ember/vendor/setting_fixtures';
import SD from 'bsrs-ember/vendor/defaults/setting';

import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_ADMIN_URL = 'admin';
const BASE_SETTINGS_URL = BASEURLS.base_setting_url;
const DETAIL_URL = BASE_SETTINGS_URL + '/' + SD.id;
const DETAIL_ROUTE = 'admin.settings';
const DOC_TYPE = 'setting';
const general_settings_link = '.t-general-settings:eq(0)';

let application, store, list_xhr, settings_data, endpoint, detail_xhr, original_uuid;

module('Acceptance | tab general settings test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('service:simpleStore');
        endpoint = PREFIX + BASE_SETTINGS_URL + '/';
        settings_data = SF.detail();
        detail_xhr = xhr(endpoint + SD.id + '/', 'GET', null, {}, 200, settings_data);
        original_uuid = random.uuid;
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('deep linking the settings detail url should push a tab into the tab store with correct properties', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = store.find('tab', SD.id);
        assert.equal(find('.t-tab-title:eq(0)').text(), t(SD.title));
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
    click(general_settings_link);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = store.find('tab', SD.id);
        assert.equal(find('.t-tab-title:eq(0)').text(), t(SD.title));
        assert.equal(tab.get('module'), DOC_TYPE);
        assert.equal(tab.get('routeName'), DETAIL_ROUTE);
        assert.equal(tab.get('redirectRoute'), BASE_ADMIN_URL);
        assert.equal(tab.get('newModel'), false);
    });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    visit(BASE_ADMIN_URL);
    andThen(() => {
        assert.equal(currentURL(), BASE_ADMIN_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click(general_settings_link);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let setting = store.find('setting', SD.id);
        assert.equal(setting.get('isDirtyOrRelatedDirty'), false);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), t(SD.title));
    });
    visit(BASE_ADMIN_URL);
    andThen(() => {
        assert.equal(currentURL(), BASE_ADMIN_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.equal(setting.get('isDirtyOrRelatedDirty'), false);
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    visit(BASE_ADMIN_URL);
    andThen(() => {
        assert.equal(currentURL(), BASE_ADMIN_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click(general_settings_link);
    fillIn('.t-settings-welcome_text:eq(0)', '1234');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let setting = store.find('setting', SD.id);
        assert.equal(setting.get('name'), SD.name);
        assert.equal(setting.get('isDirtyOrRelatedDirty'), true);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), t(SD.title));
    });
    andThen(() => {
        visit(BASE_ADMIN_URL);
        andThen(() => {
            assert.equal(currentURL(), BASE_ADMIN_URL);
        });
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.equal(setting.get('name'), SD.name);
        assert.equal(setting.get('isDirtyOrRelatedDirty'), true);
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
    click(general_settings_link);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let setting = store.find('setting', SD.id);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), t(SD.title));
    });
    click('.t-nav-admin');
    andThen(() => {
        assert.equal(currentURL(), '/' + BASE_ADMIN_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.equal(setting.get('isDirtyOrRelatedDirty'), false);
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
        assert.equal(find('.t-tab-title:eq(0)').text(), t(SD.title));
    });
    fillIn('.t-settings-welcome_text:eq(0)', '1234');
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
        assert.equal(find('.t-tab-title:eq(0)').text(), t(SD.title));
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
        assert.equal(find('.t-tab-title:eq(0)').text(), t(SD.title));
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
        assert.equal(find('.t-tab-title:eq(0)').text(), t(SD.title));
    });
    fillIn('.t-settings-welcome_text:eq(0)', '1234');
    andThen(() => {
        assert.equal(find('.dirty').length, 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), t(SD.title));
    });
    visit(BASE_ADMIN_URL);
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), BASE_ADMIN_URL);
        waitFor(() => {
            assert.equal(find('.t-modal-body').length, 1);
        });
    });
});
