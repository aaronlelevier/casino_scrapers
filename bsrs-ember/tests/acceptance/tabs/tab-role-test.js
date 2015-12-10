import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
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
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_ROLE_URL = BASEURLS.base_roles_url;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const ROLE_URL = BASE_ROLE_URL + '/index';
const NEW_URL = BASE_ROLE_URL + '/new';
const DETAIL_URL = BASE_ROLE_URL + '/' + RD.idGridTen;
const PEOPLE_URL = BASE_PEOPLE_URL + '/index';
const NEW_ROUTE = 'admin.roles.new';
const INDEX_ROUTE = 'admin.roles.index';
const DETAIL_ROUTE = 'admin.roles.role';
const DOC_TYPE = 'role';

let application, store, list_xhr, role_detail_data, endpoint, detail_xhr, original_uuid;

module('Acceptance | tab role test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_ROLE_URL + '/';
        role_detail_data = RF.detail(RD.idGridTen);
        detail_xhr = xhr(endpoint + RD.idGridTen + '/', 'GET', null, {}, 200, role_detail_data);
        original_uuid = random.uuid;
        store.push('role', {id: RD.idGridTen, name: 'wat', categories: [CF.detail()]});
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('(NEW URL) deep linking the new role url should push a tab into the tab store with correct properties', (assert) => {
    clearxhr(detail_xhr);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = tabs.objectAt(0);
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New role');
        assert.equal(tab.get('doc_type'), 'role');
        assert.equal(tab.get('doc_route'), NEW_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), true);
    });
});

test('deep linking the role detail url should push a tab into the tab store with correct properties', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = store.find('tab', RD.idGridTen);
        assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameOne);
        assert.equal(tab.get('doc_type'), DOC_TYPE);
        assert.equal(tab.get('doc_route'), DETAIL_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), false);
    });
});

test('visiting the role detail url from the list url should push a tab into the tab store', (assert) => {
    let role_list_data = RF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, role_list_data);
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(7)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = store.find('tab', RD.idGridTen);
        assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameOne);
        assert.equal(tab.get('doc_type'), DOC_TYPE);
        assert.equal(tab.get('doc_route'), DETAIL_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), false);
    });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    let role_list_data = RF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, role_list_data);
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(7)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let role = store.find('role', RD.idGridTen);
        assert.equal(role.get('isDirtyOrRelatedDirty'), false);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameOne);
    });
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let role = store.find('role', RD.idGridTen);
        assert.equal(role.get('isDirtyOrRelatedDirty'), false);
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
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New role');
    });
    let role_list_data = RF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, role_list_data);
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
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
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New role');
    });
    fillIn('.t-role-name', RD.nameTwo);
    let role_list_data = RF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, role_list_data);
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        let role = store.find('role', 'abc123');//sensitive to changes in number of roles that are bootstrapped.  Bc remove uuid = 'abc123' for new model, need to find specific one
        assert.equal(role.get('name'), RD.nameTwo);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let role = store.find('role', 'abc123');
        assert.equal(role.get('name'), RD.nameTwo);
        assert.equal(role.get('isDirtyOrRelatedDirty'), true);
    });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    let role_list_data = RF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, role_list_data);
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(7)');
    fillIn('.t-role-name', RD.nameTwo);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let role = store.find('role', RD.idGridTen);
        assert.equal(role.get('name'), RD.nameTwo);
        assert.equal(role.get('isDirtyOrRelatedDirty'), true);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameTwo);
    });
    andThen(() => {
        visit(ROLE_URL);
        andThen(() => {
            assert.equal(currentURL(), ROLE_URL);
        });
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let role = store.find('role', RD.idGridTen);
        assert.equal(role.get('name'), RD.nameTwo);
        assert.equal(role.get('isDirtyOrRelatedDirty'), true);
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('clicking on a tab that is dirty from the role url (or any non related page) should take you to the detail url and not fire off an xhr request', (assert) => {
    let role_list_data = RF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, role_list_data);
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(7)');
    fillIn('.t-role-name', RD.nameTwo);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let role = store.find('role', RD.idGridTen);
        assert.equal(role.get('name'), RD.nameTwo);
        assert.equal(role.get('isDirtyOrRelatedDirty'), true);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameTwo);
    });
    click('.t-nav-admin-role');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let role = store.find('role', RD.idGridTen);
        assert.equal(role.get('name'), RD.nameTwo);
        assert.equal(role.get('isDirtyOrRelatedDirty'), true);
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('clicking on a tab that is not dirty from the people url (or any non related page) should take you to the detail url and fire off an xhr request', (assert) => {
    xhr(endpoint + '?page=1','GET',null,{},200,RF.list());
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(7)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let role = store.find('role', RD.idGridTen);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameOne);
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
        let role = store.find('role', RD.idGridTen);
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
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameOne);
    });
    fillIn('.t-role-name', RD.nameTwo);
    andThen(() => {
        assert.equal(find('.dirty').length, 1);
    });
});

test('closing a document should close it\'s related tab', (assert) => {
    let role_list_data = RF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, role_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameOne);
    });
    click('.t-cancel-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
});

test('opening a new tab, navigating away and closing the tab should remove the tab', (assert) => {
    clearxhr(detail_xhr);
    let role_list_data = RF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, role_list_data);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New role');
        visit(ROLE_URL);
    });
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
});

test('opening a tab, navigating away and closing the tab should remove the tab', (assert) => {
    let role_list_data = RF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, role_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameOne);
        visit(ROLE_URL);
    });
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', (assert) => {
    let role_list_data = RF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, role_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), RD.nameOne);
    });
    fillIn('.t-role-name', RD.nameTwo);
    andThen(() => {
        assert.equal(find('.dirty').length, 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), `${RD.nameTwo}`);
    });
    visit(ROLE_URL);
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
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
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New role');
    });
    let role_list_data = RF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, role_list_data);
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
    });
});
