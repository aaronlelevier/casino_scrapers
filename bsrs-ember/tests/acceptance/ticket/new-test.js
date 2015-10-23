import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import config from 'bsrs-ember/config/environment';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import TICKET_FIXTURES from 'bsrs-ember/vendor/ticket_fixtures';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import {ticket_payload, required_ticket_payload} from 'bsrs-ember/tests/helpers/payloads/ticket';
import generalPage from 'bsrs-ember/tests/pages/general';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import selectize from 'bsrs-ember/tests/pages/selectize';
import page from 'bsrs-ember/tests/pages/tickets-new';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const TICKET_NEW_URL = BASE_URL + '/new';
const TICKET_LIST_URL = PREFIX + BASE_URL + '/?page=1';
const TICKET_POST_URL = PREFIX + BASE_URL + '/';
const LETTER_S = {keyCode: 83};
const LETTER_R = {keyCode: 82};
const LETTER_A = {keyCode: 65};

let application, store, list_xhr;

module('sco Acceptance | ticket new test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        list_xhr = xhr(TICKET_LIST_URL, 'GET', null, {}, 200, TICKET_FIXTURES.empty());
        let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
        xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.top_level());
    },
    afterEach() {
        random.uuid = function() { return 'abc123'; };
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

test('selecting a top level category will alter the url', (assert) => {
    random.uuid = function() { return Ember.uuid(); };
    clearxhr(list_xhr);
    page.visitNew();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('category').get('length'), 4);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
        assert.equal(components, 1);
    });
    let category = {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent: null};
    category.children = [{id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo}];
    xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idOne}/`, 'GET', null, {}, 200, category);
    let $first_component = 'select.t-ticket-category-select:eq(0)';
    click(`${$first_component}, .selectize-control:eq(0) > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('ticket').get('length'), 1);
        assert.equal(store.find('category').get('length'), 4);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 1);
        assert.equal(components, 2);
    });
    let category_two = {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent: {id: CATEGORY_DEFAULTS.nameOne}};
    category_two.children = [{id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameElectricalChild}];
    xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idTwo}/`, 'GET', null, {}, 200, category_two);
    let $second_component = 'select.t-ticket-category-select:eq(1)';
    click(`${$second_component}, .selectize-control:eq(1) > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(store.find('category').get('length'), 5);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 1);
        assert.equal(components, 3);
    });
});
