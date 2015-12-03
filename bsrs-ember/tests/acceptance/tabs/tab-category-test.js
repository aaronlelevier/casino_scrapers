import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_CATEGORY_URL = BASEURLS.base_categories_url;
const BASE_ROLE_URL = BASEURLS.base_roles_url;
const CATEGORY_URL = BASE_CATEGORY_URL + '/index';
const NEW_URL = BASE_CATEGORY_URL + '/new';
const DETAIL_URL = BASE_CATEGORY_URL + '/' + CATEGORY_DEFAULTS.idOne;
const SUBMIT_BTN = '.submit_btn';
const ROLE_URL = BASE_ROLE_URL + '/index';
const NEW_ROUTE = 'admin.categories.new';
const INDEX_ROUTE = 'admin.categories.index';
const DETAIL_ROUTE = 'admin.categories.category';
const DOC_TYPE = 'category';

let application, store, list_xhr, category_detail_data, endpoint, detail_xhr, original_uuid;

module('Acceptance | tab category test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_CATEGORY_URL + '/';
        category_detail_data = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne);
        detail_xhr = xhr(endpoint + CATEGORY_DEFAULTS.idOne + '/', 'GET', null, {}, 200, category_detail_data);
        original_uuid = random.uuid;
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('(NEW URL) deep linking the new category url should push a tab into the tab store with correct properties', (assert) => {
    clearxhr(detail_xhr);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = tabs.objectAt(0);
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New category');
        assert.equal(tab.get('doc_type'), 'category');
        assert.equal(tab.get('doc_route'), NEW_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), true);
    });
});

test('deep linking the category detail url should push a tab into the tab store with correct properties', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = store.find('tab', CATEGORY_DEFAULTS.idOne);
        assert.equal(find('.t-tab-title:eq(0)').text(), CATEGORY_DEFAULTS.nameOne);
        assert.equal(tab.get('doc_type'), DOC_TYPE);
        assert.equal(tab.get('doc_route'), DETAIL_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), false);
    });
});

test('visiting the category detail url from the list url should push a tab into the tab store', (assert) => {
    let category_list_data = CATEGORY_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
    visit(CATEGORY_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = store.find('tab', CATEGORY_DEFAULTS.idOne);
        assert.equal(find('.t-tab-title:eq(0)').text(), CATEGORY_DEFAULTS.nameOne);
        assert.equal(tab.get('doc_type'), DOC_TYPE);
        assert.equal(tab.get('doc_route'), DETAIL_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), false);
    });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    let category_list_data = CATEGORY_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
    visit(CATEGORY_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.equal(category.get('isDirtyOrRelatedDirty'), false);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), CATEGORY_DEFAULTS.nameOne);
    });
    visit(CATEGORY_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.equal(category.get('isDirtyOrRelatedDirty'), false);
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
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New category');
    });
    let category_list_data = CATEGORY_FIXTURES.list();
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

test('(NEW URL) clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    random.uuid = function() { return UUID.value; };
    clearxhr(detail_xhr);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New category');
    });
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameTwo);
    let category_list_data = CATEGORY_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
    visit(CATEGORY_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL);
        let category = store.find('category', UUID.value);
        assert.equal(category.get('name'), CATEGORY_DEFAULTS.nameTwo);
        assert.equal(category.get('isDirtyOrRelatedDirty'), true);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let category = store.find('category', UUID.value);
        assert.equal(category.get('name'), CATEGORY_DEFAULTS.nameTwo);
        assert.equal(category.get('isDirtyOrRelatedDirty'), true);
    });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    let category_list_data = CATEGORY_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
    visit(CATEGORY_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameTwo);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.equal(category.get('name'), CATEGORY_DEFAULTS.nameTwo);
        assert.equal(category.get('isDirtyOrRelatedDirty'), true);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), CATEGORY_DEFAULTS.nameTwo);
    });
    andThen(() => {
        visit(CATEGORY_URL);
        andThen(() => {
            assert.equal(currentURL(), CATEGORY_URL);
        });
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.equal(category.get('name'), CATEGORY_DEFAULTS.nameTwo);
        assert.equal(category.get('isDirtyOrRelatedDirty'), true);
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('clicking on a tab that is dirty from the role url (or any non related page) should take you to the detail url and not fire off an xhr request', (assert) => {
    let category_list_data = CATEGORY_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
    visit(CATEGORY_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameTwo);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.equal(category.get('name'), CATEGORY_DEFAULTS.nameTwo);
        assert.equal(category.get('isDirtyOrRelatedDirty'), true);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), CATEGORY_DEFAULTS.nameTwo);
    });
    andThen(() => {
        let endpoint = PREFIX + BASE_ROLE_URL + '/';
        xhr(endpoint + '?page=1','GET',null,{},200,ROLE_FIXTURES.list());
        visit(ROLE_URL);
        andThen(() => {
            assert.equal(currentURL(), ROLE_URL);
        });
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.equal(category.get('name'), CATEGORY_DEFAULTS.nameTwo);
        assert.equal(category.get('isDirtyOrRelatedDirty'), true);
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('clicking on a tab that is not dirty from the role url (or any non related page) should take you to the detail url and fire off an xhr request', (assert) => {
    xhr(endpoint + '?page=1','GET',null,{},200,CATEGORY_FIXTURES.list());
    visit(CATEGORY_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), CATEGORY_DEFAULTS.nameOne);
    });
    let role_endpoint = PREFIX + BASE_ROLE_URL + '/';
    xhr(role_endpoint + '?page=1','GET',null,{},200, ROLE_FIXTURES.list());
    click('.t-nav-admin-role');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.equal(category.get('isDirtyOrRelatedDirty'), false);
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
        assert.equal(find('.t-tab-title:eq(0)').text(), CATEGORY_DEFAULTS.nameOne);
    });
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameTwo);
    andThen(() => {
        assert.equal(find('.dirty').length, 1);
    });
});

test('closing a document should close it\'s related tab', (assert) => {
    let category_list_data = CATEGORY_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), CATEGORY_DEFAULTS.nameOne);
        click('.t-cancel-btn:eq(0)');
        andThen(() => {
          assert.equal(tabs.get('length'), 0);
        });
    });
});

test('opening a tab, navigating away and closing the tab should remove the tab', (assert) => {
    let category_list_data = CATEGORY_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), CATEGORY_DEFAULTS.nameOne);
        visit(CATEGORY_URL);
    });
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', (assert) => {
    let category_list_data = CATEGORY_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), CATEGORY_DEFAULTS.nameOne);
    });
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameTwo);
    andThen(() => {
        assert.equal(find('.dirty').length, 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), `${CATEGORY_DEFAULTS.nameTwo}`);
    });
    visit(CATEGORY_URL);
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL);
        waitFor(() => {
            assert.equal(find('.t-modal-body').length, 1);
        });
    });
});

test('(NEW URL) clicking on the new link with a new tab of the same type open will redirect to open tab', (assert) => {
    clearxhr(detail_xhr);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New category');
    });
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameTwo);
    let category_list_data = CATEGORY_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, category_list_data);
    visit(CATEGORY_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_URL);
    });
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
    });
});
