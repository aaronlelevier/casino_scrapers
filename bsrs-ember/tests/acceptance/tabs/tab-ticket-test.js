import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import TICKET_FIXTURES from 'bsrs-ember/vendor/ticket_fixtures';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_TICKET_URL = BASEURLS.base_tickets_url;
const BASE_ROLE_URL = BASEURLS.base_roles_url;
const ticket_URL = BASE_TICKET_URL + '/index';
const NEW_URL = BASE_TICKET_URL + '/new';
const DETAIL_URL = BASE_TICKET_URL + '/' + TICKET_DEFAULTS.idOne;
const SUBMIT_BTN = '.submit_btn';
const ROLE_URL = BASE_ROLE_URL + '/index';
const SAVE_BTN = '.t-save-btn';
const NEW_ROUTE = 'tickets.new';
const INDEX_ROUTE = 'tickets.index';
const DETAIL_ROUTE = 'tickets.ticket';
const DOC_TYPE = 'ticket';

let application, store, list_xhr, ticket_detail_data, endpoint, detail_xhr;

module('Acceptance | tab ticket test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_TICKET_URL + '/';
        ticket_detail_data = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
        detail_xhr = xhr(endpoint + TICKET_DEFAULTS.idOne + '/', 'GET', null, {}, 200, ticket_detail_data);
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('(NEW URL) deep linking the new ticket url should push a tab into the tab store with correct properties', (assert) => {
    clearxhr(detail_xhr);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = tabs.objectAt(0);
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New ticket');
        assert.equal(tab.get('doc_type'), 'ticket');
        assert.equal(tab.get('doc_route'), NEW_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), true);
    });
});

test('deep linking the ticket detail url should push a tab into the tab store with correct properties', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = store.find('tab', TICKET_DEFAULTS.idOne);
        assert.equal(find('.t-tab-title:eq(0)').text(), TICKET_DEFAULTS.subjectOne);
        assert.equal(tab.get('doc_type'), DOC_TYPE);
        assert.equal(tab.get('doc_route'), DETAIL_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), false);
    });
});

test('visiting the ticket detail url from the list url should push a tab into the tab store', (assert) => {
    let ticket_list_data = TICKET_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
    visit(ticket_URL);
    andThen(() => {
        assert.equal(currentURL(), ticket_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = store.find('tab', TICKET_DEFAULTS.idOne);
        // assert.equal(find('.t-tab-title:eq(0)').text(), TICKET_DEFAULTS.subjectOne);
        assert.equal(tab.get('doc_type'), DOC_TYPE);
        assert.equal(tab.get('doc_route'), DETAIL_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), false);
    });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    let ticket_list_data = TICKET_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
    visit(ticket_URL);
    andThen(() => {
        assert.equal(currentURL(), ticket_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('isDirtyOrRelatedDirty'), false);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        // assert.equal(find('.t-tab-title:eq(0)').text(), TICKET_DEFAULTS.subjectOne);
    });
    visit(ticket_URL);
    andThen(() => {
        assert.equal(currentURL(), ticket_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        // assert.equal(ticket.get('isDirtyOrRelatedDirty'), false);
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
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New ticket');
    });
    let ticket_list_data = TICKET_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
    visit(ticket_URL);
    andThen(() => {
        assert.equal(currentURL(), ticket_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
    });
});

test('(NEW URL) clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    clearxhr(detail_xhr);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), 'New ticket');
    });
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectTwo);
    let ticket_list_data = TICKET_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
    visit(ticket_URL);
    andThen(() => {
        assert.equal(currentURL(), ticket_URL);
        let ticket = store.find('ticket', UUID.value);
        assert.equal(ticket.get('subject'), TICKET_DEFAULTS.subjectTwo);
        assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let ticket = store.find('ticket', UUID.value);
        assert.equal(ticket.get('subject'), TICKET_DEFAULTS.subjectTwo);
        assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
    });
});

test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    let ticket_list_data = TICKET_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
    visit(ticket_URL);
    andThen(() => {
        assert.equal(currentURL(), ticket_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectTwo);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('subject'), TICKET_DEFAULTS.subjectTwo);
        assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), TICKET_DEFAULTS.subjectTwo);
    });
    andThen(() => {
        visit(ticket_URL);
        andThen(() => {
            assert.equal(currentURL(), ticket_URL);
        });
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('subject'), TICKET_DEFAULTS.subjectTwo);
        assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('clicking on a tab that is dirty from the role url (or any non related page) should take you to the detail url and not fire off an xhr request', (assert) => {
    let ticket_list_data = TICKET_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
    visit(ticket_URL);
    andThen(() => {
        assert.equal(currentURL(), ticket_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectTwo);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('subject'), TICKET_DEFAULTS.subjectTwo);
        assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        // assert.equal(find('.t-tab-title:eq(0)').text(), TICKET_DEFAULTS.subjectTwo);
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
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('subject'), TICKET_DEFAULTS.subjectTwo);
        assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('clicking on a tab that is not dirty from the role url (or any non related page) should take you to the detail url and fire off an xhr request', (assert) => {
    xhr(endpoint + '?page=1','GET',null,{},200,TICKET_FIXTURES.list());
    visit(ticket_URL);
    andThen(() => {
        assert.equal(currentURL(), ticket_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        // assert.equal(find('.t-tab-title:eq(0)').text(), TICKET_DEFAULTS.subjectOne);
    });
    let role_endpoint = PREFIX + BASE_ROLE_URL + '/';
    xhr(role_endpoint + '?page=1','GET',null,{},200, ROLE_FIXTURES.list());
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('isDirtyOrRelatedDirty'), false);
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
        assert.equal(find('.t-tab-title:eq(0)').text(), TICKET_DEFAULTS.subjectOne);
    });
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectTwo);
    andThen(() => {
        assert.equal(find('.dirty').length, 1);
    });
});

test('closing a document should close it\'s related tab', (assert) => {
    let ticket_list_data = TICKET_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), TICKET_DEFAULTS.subjectOne);
        click('.t-cancel-btn:eq(0)');
        andThen(() => {
          assert.equal(tabs.get('length'), 0);
        });
    });
});

test('opening a tab, navigating away and closing the tab should remove the tab', (assert) => {
    let ticket_list_data = TICKET_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), TICKET_DEFAULTS.subjectOne);
    });
    visit(ticket_URL);
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), ticket_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', (assert) => {
    let ticket_list_data = TICKET_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ticket_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), TICKET_DEFAULTS.subjectOne);
    });
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectTwo);
    andThen(() => {
        assert.equal(find('.dirty').length, 1);
        assert.equal(find('.t-tab-title:eq(0)').text(), `${TICKET_DEFAULTS.subjectTwo}`);
    });
    visit(ticket_URL);
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), ticket_URL);
        waitFor(() => {
            assert.equal(find('.t-modal-body').length, 1);
        });
    });
});
