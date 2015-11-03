import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import THIRD_PARTY_FIXTURES from 'bsrs-ember/vendor/third_party_fixtures';
import PERSON_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import THIRD_PARTY_DEFAULTS from 'bsrs-ember/vendor/defaults/third-party';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_THIRD_PARTY_URL = BASEURLS.base_third_parties_url;
const THIRD_PARTY_URL = BASE_THIRD_PARTY_URL + '/index';
const NEW_URL = BASE_THIRD_PARTY_URL + '/new';
const DETAIL_URL = BASE_THIRD_PARTY_URL + '/' + THIRD_PARTY_DEFAULTS.idOne;
const SUBMIT_BTN = '.submit_btn';
const NEW_ROUTE = 'admin.third-parties.new';
const INDEX_ROUTE = 'admin.third-parties.index';
const DETAIL_ROUTE = 'admin.third-parties.third-party';
const DOC_TYPE = 'third-party';
const BASE_PERSON_URL = BASEURLS.base_people_url;
const PERSON_URL = BASE_PERSON_URL + '/index';

let application, store, list_xhr, third_party_detail_data, endpoint, detail_xhr, original_uuid;

module('Acceptance | tab third-party test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_THIRD_PARTY_URL + '/';
        var third_party_detail_data = THIRD_PARTY_FIXTURES.detail(THIRD_PARTY_DEFAULTS.idOne);
        detail_xhr = xhr(endpoint + THIRD_PARTY_DEFAULTS.idOne + '/', 'GET', null, {}, 200, third_party_detail_data);
        original_uuid = random.uuid;
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('(NEW URL) deep linking the new third-party url should push a tab into the tab store with correct properties', (assert) => {
    clearxhr(detail_xhr);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = tabs.objectAt(0);
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New '+DOC_TYPE);
        assert.equal(tab.get('doc_type'), DOC_TYPE);
        assert.equal(tab.get('doc_route'), NEW_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), true);
    });
});

test('deep linking the third-party detail url should push a tab into the tab store with correct properties', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = store.find('tab', THIRD_PARTY_DEFAULTS.idOne);
        assert.equal(find('.t-tab-title:eq(0)').text(), THIRD_PARTY_DEFAULTS.nameOne);
        assert.equal(tab.get('doc_type'), DOC_TYPE);
        assert.equal(tab.get('doc_route'), DETAIL_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), false);
    });
});

test('visiting the third_party detail url from the list url should push a tab into the tab store', (assert) => {
    let third_party_list_data = THIRD_PARTY_FIXTURES.list();
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, third_party_list_data);
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
        let tab = store.find('tab', THIRD_PARTY_DEFAULTS.idOne);
        assert.equal(find('.t-tab-title:eq(0)').text(), THIRD_PARTY_DEFAULTS.nameOne);
        assert.equal(tab.get('doc_type'), DOC_TYPE);
        assert.equal(tab.get('doc_route'), DETAIL_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), false);
    });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    let list_data = THIRD_PARTY_FIXTURES.list();
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, list_data);
    visit(THIRD_PARTY_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
        assert.equal(third_party.get('isDirtyOrRelatedDirty'), false);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        // assert.equal(find('.t-tab-title:eq(0)').text(), THIRD_PARTY_DEFAULTS.nameOne);    // does smthn in /third-parties/third-party/.. need to change?
    });
    visit(THIRD_PARTY_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
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
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New '+DOC_TYPE);
    });
    let list_data = THIRD_PARTY_FIXTURES.list();
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, list_data);
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
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New '+DOC_TYPE);
    });
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameTwo);
    let list_data = THIRD_PARTY_FIXTURES.list();
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, list_data);
    visit(THIRD_PARTY_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
        let third_party = store.find('third-party', UUID.value);
        assert.equal(third_party.get('name'), THIRD_PARTY_DEFAULTS.nameTwo);
        assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let third_party = store.find('third-party', UUID.value);
        assert.equal(third_party.get('name'), THIRD_PARTY_DEFAULTS.nameTwo);
        assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);
    });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    let third_party_list_data = THIRD_PARTY_FIXTURES.list();
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, third_party_list_data);
    visit(THIRD_PARTY_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameTwo);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
        assert.equal(third_party.get('name'), THIRD_PARTY_DEFAULTS.nameTwo);
        assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), THIRD_PARTY_DEFAULTS.nameTwo);
    });
    visit(THIRD_PARTY_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
        assert.equal(third_party.get('name'), THIRD_PARTY_DEFAULTS.nameTwo); // Not passing
        assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);    // TODO: Is this how it works w/ other Tabs being dirty??
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('clicking on a tab that is dirty from the person url (or any non related page) should take you to the detail url and not fire off an xhr request', (assert) => {
    let third_party_list_data = THIRD_PARTY_FIXTURES.list();
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, third_party_list_data);
    visit(THIRD_PARTY_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameTwo);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
        assert.equal(third_party.get('name'), THIRD_PARTY_DEFAULTS.nameTwo);
        assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), THIRD_PARTY_DEFAULTS.nameTwo);
    });
    andThen(() => {
        let endpoint = PREFIX + BASE_PERSON_URL + '/';
        xhr(endpoint+'?page=1', 'GET', null, {}, 200, PERSON_FIXTURES.list());
        visit(PERSON_URL);
        andThen(() => {
            assert.equal(currentURL(), PERSON_URL);
        });
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
        assert.equal(third_party.get('name'), THIRD_PARTY_DEFAULTS.nameTwo);
        assert.equal(third_party.get('isDirtyOrRelatedDirty'), true);
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('clicking on a tab that is not dirty from the person url (or any non related page) \
    should take you to the detail url and fire off an xhr request', (assert) => {
    xhr(endpoint, 'GET', null, {}, 200, THIRD_PARTY_FIXTURES.list());
    visit(THIRD_PARTY_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), THIRD_PARTY_DEFAULTS.nameOne);
    });
    let person_endpoint = PREFIX + BASE_PERSON_URL + '/';
    xhr(person_endpoint + '?page=1','GET', null, {}, 200, PERSON_FIXTURES.list());
    click('.t-nav-admin-people');
    andThen(() => {
        assert.equal(currentURL(), PERSON_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
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
        assert.equal(find('.t-tab-title:eq(0)').text(), THIRD_PARTY_DEFAULTS.nameOne);
    });
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameTwo);
    andThen(() => {
        assert.equal(find('.dirty').length, 1);
    });
});

test('closing a document should close its related tab', (assert) => {
    let third_party_list_data = THIRD_PARTY_FIXTURES.list();
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, third_party_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), THIRD_PARTY_DEFAULTS.nameOne);
        click('.t-cancel-btn:eq(0)');
        andThen(() => {
          assert.equal(tabs.get('length'), 0);
        });
    });
});

test('opening a tab, navigating away and closing the tab should remove the tab', (assert) => {
    let third_party_list_data = THIRD_PARTY_FIXTURES.list();
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, third_party_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), THIRD_PARTY_DEFAULTS.nameOne);
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
    let third_party_list_data = THIRD_PARTY_FIXTURES.list();
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, third_party_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), THIRD_PARTY_DEFAULTS.nameOne);
    });
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameTwo);
    andThen(() => {
        assert.equal(find('.dirty').length, 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), `${THIRD_PARTY_DEFAULTS.nameTwo}`);
    });
    visit(THIRD_PARTY_URL);
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
        waitFor(() => {
            assert.equal(find('.t-modal-body').length, 1);
        });
    });
});

