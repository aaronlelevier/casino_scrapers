import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import config from 'bsrs-ember/config/environment';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import TICKET_FIXTURES from 'bsrs-ember/vendor/ticket_fixtures';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import {ticket_payload, required_ticket_payload} from 'bsrs-ember/tests/helpers/payloads/ticket';
import generalPage from 'bsrs-ember/tests/pages/general';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import selectize from 'bsrs-ember/tests/pages/selectize';
import page from 'bsrs-ember/tests/pages/tickets-new';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const TICKET_NEW_URL = BASE_URL + '/new';
const TICKET_LIST_URL = PREFIX + BASE_URL + '/?page=1';
const TICKET_POST_URL = PREFIX + BASE_URL + '/';

let application, store, list_xhr;

module('Acceptance | ticket new test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        list_xhr = xhr(TICKET_LIST_URL, 'GET', null, {}, 200, TICKET_FIXTURES.empty());
        let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
        xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.top_level());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting ticket/new', (assert) => {
    page.visit();
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.equal(store.find('ticket').get('length'), 1);
        assert.ok(store.find('ticket', UUID.value).get('isNotDirty'));
    });
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectOne);
    fillIn('.t-ticket-status', TICKET_DEFAULTS.statusOneId);
    fillIn('.t-ticket-priority', TICKET_DEFAULTS.priorityOneId);
    xhr(TICKET_POST_URL, 'POST', JSON.stringify(ticket_payload), {}, 201, Ember.$.extend(true, {}, ticket_payload));
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(store.find('ticket').get('length'), 1);
        let persisted = store.find('ticket', UUID.value);
        assert.equal(persisted.get('subject'), TICKET_DEFAULTS.subjectOne);
        assert.equal(persisted.get('status.id'), TICKET_DEFAULTS.statusOneId);
        assert.ok(persisted.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    page.visit();
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-status-validation-error').is(':hidden'));
        assert.ok(find('.t-priority-validation-error').is(':hidden'));
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-status-validation-error').is(':visible'));
        assert.ok(find('.t-priority-validation-error').is(':visible'));
    });
    fillIn('.t-ticket-status', TICKET_DEFAULTS.statusOneId);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-priority-validation-error').is(':visible'));
    });
    fillIn('.t-ticket-priority', TICKET_DEFAULTS.priorityOneId);
    generalPage.save();
    xhr(TICKET_POST_URL, 'POST', JSON.stringify(required_ticket_payload), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

// test('selecting a top level category will alter the url', (assert) => {
//     clearxhr(list_xhr);
//     page.visitNew();
//     andThen(() => {
//         assert.equal(find('select.t-ticket-category-select').get('length'), 1);
//     });
//     page.clickCategorySelectizeOption();
//     andThen(() => {
//         assert.equal(store.find('ticket').get('length'), 1);
//         assert.equal(find('select.t-ticket-category-select').get('length'), 2);
//     });
// });
