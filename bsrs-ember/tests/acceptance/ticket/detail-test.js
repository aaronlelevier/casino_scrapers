import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_CURRENT_DEFAULTS from 'bsrs-ember/vendor/defaults/person-current';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_FIXTURES from 'bsrs-ember/vendor/ticket_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TICKET_DEFAULTS.idOne;
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';
const CANCEL_BTN = '.t-cancel-btn';
const LETTER_A = {keyCode: 65};
const SPACEBAR = {keyCode: 32};

let application, store, endpoint, list_xhr, random_uuid;

module('Acceptance | detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, TICKET_FIXTURES.list());
        xhr(endpoint + TICKET_DEFAULTS.idOne + '/', 'GET', null, {}, 200, TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne));
        random.uuid = function() { return Ember.uuid(); };
    },
    afterEach() {
        Ember.run(application, 'destroy');
        random.uuid = function() { return 'abc123'; };
    }
});

test('clicking a tickets subject will redirect to the given detail view', (assert) => {
    visit(TICKETS_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('when you deep link to the ticket detail view you get bound attrs', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.ok(ticket.get('isNotDirty'));
        assert.equal(find('.t-ticket-subject').val(), TICKET_DEFAULTS.subjectOne);
        assert.equal(find('.t-ticket-priority').val(), TICKET_DEFAULTS.priorityOneId);
        assert.equal(find('.t-ticket-status').val(), TICKET_DEFAULTS.statusOneId);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, subject: TICKET_DEFAULTS.subjectTwo, status: TICKET_DEFAULTS.statusTwoId, priority: TICKET_DEFAULTS.priorityTwoId});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectTwo);
    fillIn('.t-ticket-priority', TICKET_DEFAULTS.priorityTwoId);
    fillIn('.t-ticket-status', TICKET_DEFAULTS.statusTwoId);
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.ok(ticket.get('isDirty'));
    });
    let list = TICKET_FIXTURES.list();
    list.results[0].subject = TICKET_DEFAULTS.subjectOne;
    list.results[0].status = TICKET_DEFAULTS.statusOneId;
    list.results[0].priority = TICKET_DEFAULTS.priorityOneId;
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
        assert.equal(store.find('ticket').get('length'), 10);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        // assert.equal(ticket.get('subject'), TICKET_DEFAULTS.subjectTwo);
        // assert.equal(ticket.get('status'), TICKET_DEFAULTS.statusTwoId);
        // assert.equal(ticket.get('priority'), TICKET_DEFAULTS.priorityTwoId);
        assert.ok(ticket.get('isNotDirty'));
    });
});

test('when you click cancel, you are redirected to the ticket list view', (assert) => {
    visit(DETAIL_URL);
    click(CANCEL_BTN);
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('when editing the ticket subject to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-ticket-subject', '');
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-subject-validation-error').text().trim(), 'invalid subject');
    });
    fillIn('.t-ticket-subject', '');
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-subject-validation-error').text().trim(), 'invalid subject');
    });
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectTwo);
    let url = PREFIX + DETAIL_URL + "/";
    let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, subject: TICKET_DEFAULTS.subjectTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectTwo);
    click(CANCEL_BTN);
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-ticket-subject').val(), TICKET_DEFAULTS.subjectTwo);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when click delete, ticket is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(PREFIX + BASE_URL + '/' + TICKET_DEFAULTS.idOne + '/', 'DELETE', null, {}, 204, {});
    click('.t-delete-btn');
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
        assert.equal(store.find('ticket', TICKET_DEFAULTS.idOne).get('length'), undefined);
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-subject-validation-error').is(':hidden'));
    });
    fillIn('.t-ticket-subject', '');
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-subject-validation-error').is(':visible'));
    });
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectOne);
    fillIn('.t-ticket-priority', TICKET_DEFAULTS.priorityOneId);
    fillIn('.t-ticket-status', TICKET_DEFAULTS.statusOneId);
    let url = PREFIX + DETAIL_URL + '/';
    let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, subject: TICKET_DEFAULTS.subjectOne, status: TICKET_DEFAULTS.statusOneId, priority: TICKET_DEFAULTS.priorityOneId});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    visit(TICKETS_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });
    click('.t-cancel-btn');
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectTwo);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-ticket-subject').val(), TICKET_DEFAULTS.subjectTwo);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectTwo);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), TICKETS_URL);
        });
    });
});

// test('clicking and typing into selectize for people will fire off xhr request for all people', (assert) => {
//     visit(DETAIL_URL);
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('cc').get('length'), 1);
//         assert.equal(find('div.item').length, 1);
//         assert.equal(find('div.option').length, 0);
//     });
//     let people_endpoint = PREFIX + '/admin/people/' + '?fullname__icontains=a';
//     xhr(people_endpoint, 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
//     fillIn('.selectize-input input', 'a');
//     triggerEvent('.selectize-input input', 'keyup', LETTER_A);
//     click('.t-ticket-people-select div.option:eq(0)');
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('ticket_people_fks').length, 1);
//         assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//         assert.equal(find('div.item').length, 2);
//         assert.equal(find('div.option').length, 9);
//     });
//     let url = PREFIX + DETAIL_URL + "/";
//     let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: [PEOPLE_CURRENT_DEFAULTS.id, PEOPLE_DEFAULTS.id]});
//     xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
//     click(SAVE_BTN);
//     andThen(() => {
//         assert.equal(currentURL(), TICKETS_URL);
//     });
// });

test('when you deep link to the ticket detail can remove a cc', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.equal(find('div.item').length, 1);
        assert.equal(find('div.option').length, 0);
    });
    click('div.item > a.remove:eq(0)');
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('cc').get('length'), 0);
        // assert.equal(find('div.option').length, 1); @toranb need help from scott
        assert.equal(find('div.item').length, 0);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: []});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});
