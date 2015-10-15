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

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const TICKET_NEW_URL = BASE_URL + '/new';
const TICKET_LIST_URL = PREFIX + BASE_URL + '/?page=1';
const TICKET_POST_URL = PREFIX + BASE_URL + '/';
const SAVE_BTN = '.t-save-btn';

let application, store;

module('Acceptance | ticket-new', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        xhr(TICKET_LIST_URL, 'GET', null, {}, 200, TICKET_FIXTURES.empty());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting ticket/new', (assert) => {
    visit(TICKET_URL);
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
    click(SAVE_BTN);
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
    visit(TICKET_URL);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-status-validation-error').is(':hidden'));
        assert.ok(find('.t-priority-validation-error').is(':hidden'));
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-status-validation-error').is(':visible'));
        assert.ok(find('.t-priority-validation-error').is(':visible'));
    });
    fillIn('.t-ticket-status', TICKET_DEFAULTS.statusOneId);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-priority-validation-error').is(':visible'));
    });
    fillIn('.t-ticket-priority', TICKET_DEFAULTS.priorityOneId);
    click(SAVE_BTN);
    xhr(TICKET_POST_URL, 'POST', JSON.stringify(required_ticket_payload), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});
