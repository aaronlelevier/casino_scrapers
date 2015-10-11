import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_FIXTURES from 'bsrs-ember/vendor/ticket_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TICKET_DEFAULTS.idOne;
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';
const CANCEL_BTN = '.t-cancel-btn';

let application, store, endpoint, list_xhr;

module('Acceptance | detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, TICKET_FIXTURES.list());
        xhr(endpoint + TICKET_DEFAULTS.idOne + '/', 'GET', null, {}, 200, TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne));
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('clicking a tickets number will redirect to the given detail view', (assert) => {
    visit(TICKETS_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

// test('when you deep link to the ticket detail view you get bound attrs', (assert) => {
//     clearxhr(list_xhr);
//     visit(DETAIL_URL);
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.ok(ticket.get('isNotDirty'));
//         assert.equal(find('.t-ticket-number').val(), TICKET_DEFAULTS.numberOne);
//         assert.equal(find('.t-ticket-subject').val(), TICKET_DEFAULTS.subjectOne);
//         assert.equal(find('.t-ticket-priorty').val(), TICKET_DEFAULTS.priorityOne);
//         assert.equal(find('.t-ticket-status').val(), TICKET_DEFAULTS.statusOne);
//     });
//     let url = PREFIX + DETAIL_URL + '/';
//     let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
//     let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, number: TICKET_DEFAULTS.numberTwo, subject: TICKET_DEFAULTS.subjectTwo, priority: TICKET_DEFAULTS.priorityTwo});
//     xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
//     fillIn('.t-ticket-number', TICKET_DEFAULTS.numberTwo);
//     fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectOne);
//     fillIn('.t-ticket-priority', TICKET_DEFAULTS.priorityTwo);
//     fillIn('.t-ticket-status', TICKET_DEFAULTS.statusTwo);
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.ok(ticket.get('isDirty'));
//     });
//     let list = TICKET_FIXTURES.list();
//     list.results[0].number = TICKET_DEFAULTS.numberTwo;
//     list.results[0].subject = TICKET_DEFAULTS.subjectOne;
//     list.results[0].status = TICKET_DEFAULTS.statusOne;
//     list.results[0].priority = TICKET_DEFAULTS.priorityOne;
//     xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
//     click(SAVE_BTN);
//     andThen(() => {
//         assert.equal(currentURL(), TICKETS_URL);
//         assert.equal(store.find('ticket').get('length'), 10);
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('number'), TICKET_DEFAULTS.numberTwo);
//         assert.equal(ticket.get('subject'), TICKET_DEFAULTS.subjectOne);
//         assert.equal(ticket.get('status'), TICKET_DEFAULTS.statusTwo);
//         assert.equal(ticket.get('priority'), TICKET_DEFAULTS.priorityTwo);
//         assert.ok(ticket.get('isNotDirty'));
//     });
// });

// test('when you click cancel, you are redirected to the ticket list view', (assert) => {
//     visit(DETAIL_URL);
//     click(CANCEL_BTN);
//     andThen(() => {
//         assert.equal(currentURL(), TICKETS_URL);
//     });
// });

// test('when editing the ticket number to invalid, it checks for validation', (assert) => {
//     visit(DETAIL_URL);
//     fillIn('.t-ticket-number', '');
//     click(SAVE_BTN);
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         assert.equal(find('.t-number-validation-error').text().trim(), 'invalid number');
//     });
//     fillIn('.t-ticket-subject', '');
//     click(SAVE_BTN);
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         assert.equal(find('.t-subject-validation-error').text().trim(), 'Invalid subject');
//     });
//     fillIn('.t-ticket-number', TICKET_DEFAULTS.numberTwo);
//     fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectOne);
//     let url = PREFIX + DETAIL_URL + "/";
//     let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
//     let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, number: TICKET_DEFAULTS.numberTwo});
//     xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
//     click(SAVE_BTN);
//     andThen(() => {
//         assert.equal(currentURL(), TICKETS_URL);
//     });
// });

// test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', (assert) => {
//     clearxhr(list_xhr);
//     visit(DETAIL_URL);
//     fillIn('.t-ticket-number', TICKET_DEFAULTS.numberTwo);
//     click(CANCEL_BTN);
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), DETAIL_URL);
//             assert.equal(find('.t-modal').is(':visible'), true);
//             assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
//         });
//     });
//     click('.t-modal-footer .t-modal-cancel-btn');
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), DETAIL_URL);
//             assert.equal(find('.t-ticket-number').val(), TICKET_DEFAULTS.numberTwo);
//             assert.equal(find('.t-modal').is(':hidden'), true);
//         });
//     });
// });

// test('when click delete, ticket is deleted and removed from store', (assert) => {
//     visit(DETAIL_URL);
//     xhr(PREFIX + BASE_URL + '/' + TICKET_DEFAULTS.idOne + '/', 'DELETE', null, {}, 204, {});
//     click('.t-delete-btn');
//     andThen(() => {
//         assert.equal(currentURL(), TICKETS_URL);
//         assert.equal(store.find('ticket', TICKET_DEFAULTS.idOne).get('length'), undefined);
//     });
// });

// test('validation works and when hit save, we do same post', (assert) => {
//     visit(DETAIL_URL);
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         assert.ok(find('.t-number-validation-error').is(':hidden'));
//         assert.ok(find('.t-subject-validation-error').is(':hidden'));
//     });
//     fillIn('.t-ticket-number', '');
//     click(SAVE_BTN);
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         assert.ok(find('.t-number-validation-error').is(':visible'));
//         assert.ok(find('.t-subject-validation-error').is(':hidden'));
//     });
//     fillIn('.t-ticket-subject', '');
//     click(SAVE_BTN);
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         assert.ok(find('.t-number-validation-error').is(':visible'));
//         assert.ok(find('.t-subject-validation-error').is(':visible'));
//     });
//     fillIn('.t-ticket-number', TICKET_DEFAULTS.numberOne);
//     fillIn('.t-ticket-subject', TICKET_DEFAULTS.subjectOne);
//     fillIn('.t-ticket-priority', TICKET_DEFAULTS.priorityOne);
//     fillIn('.t-ticket-status', TICKET_DEFAULTS.statusOne);
//     let url = PREFIX + DETAIL_URL + '/';
//     let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
//     let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, number: TICKET_DEFAULTS.numberOne, subject: TICKET_DEFAULTS.subjectOne, priority: TICKET_DEFAULTS.priorityOne, status: TICKET_DEFAULTS.statusOne});
//     xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
//     click(SAVE_BTN);
//     andThen(() => {
//         assert.equal(currentURL(), TICKETS_URL);
//     });
// });

// test('clicking cancel button will take from detail view to list view', (assert) => {
//     visit(TICKETS_URL);
//     andThen(() => {
//         assert.equal(currentURL(), TICKETS_URL);
//     });
//     click('.t-grid-data:eq(0)');
//     andThen(() => {
//         assert.equal(currentURL(),DETAIL_URL);
//     });
//     click('.t-cancel-btn');
//     andThen(() => {
//         assert.equal(currentURL(), TICKETS_URL);
//     });
// });

// test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
//     clearxhr(list_xhr);
//     visit(DETAIL_URL);
//     fillIn('.t-ticket-number', TICKET_DEFAULTS.numberTwo);
//     click('.t-cancel-btn');
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), DETAIL_URL);
//             assert.equal(find('.t-modal').is(':visible'), true);
//             assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
//         });
//     });
//     click('.t-modal-footer .t-modal-cancel-btn');
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), DETAIL_URL);
//             assert.equal(find('.t-ticket-number').val(), TICKET_DEFAULTS.numberTwo);
//             assert.equal(find('.t-modal').is(':hidden'), true);
//         });
//     });
// });

// test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
//     visit(DETAIL_URL);
//     fillIn('.t-ticket-number', TICKET_DEFAULTS.numberTwo);
//     click('.t-cancel-btn');
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), DETAIL_URL);
//             assert.equal(find('.t-modal').is(':visible'), true);
//         });
//     });
//     click('.t-modal-footer .t-modal-rollback-btn');
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), TICKETS_URL);
//         });
//     });
// });

