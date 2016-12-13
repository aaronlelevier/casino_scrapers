import Ember from 'ember';
import { test } from 'qunit';
import trim from 'bsrs-ember/utilities/trim';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
// import timemachine from 'vendor/timemachine';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import {ticket_payload, required_ticket_payload, ticket_payload_detail, ticket_payload_detail_one_category} from 'bsrs-ember/tests/helpers/payloads/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TAD from 'bsrs-ember/vendor/defaults/ticket_activity';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import AD from 'bsrs-ember/vendor/defaults/automation';
import AF from 'bsrs-ember/vendor/automation_fixtures';
import GD from 'bsrs-ember/vendor/defaults/general';
import PF from 'bsrs-ember/vendor/people_fixtures';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/tickets';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { TICKETS_URL, TICKET_LIST_URL, LOCATIONS_URL, PEOPLE_URL, CATEGORIES_URL, DT_URL, AUTOMATION_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const DETAIL_URL = `${TICKET_LIST_URL}/${TD.idOne}`;
const TICKET_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
const ACTIVITY_ITEMS = '.t-activity-list-item';

let endpoint, list_xhr, detail_xhr;

moduleForAcceptance('Acceptance | general ticket activity test', {
  beforeEach() {
    // timemachine.config({
    //   dateString: 'December 25, 2015 13:12:59'
    // });
    endpoint = `${PREFIX}${TICKET_LIST_URL}/`;
    const detail_data = TF.detail(TD.idOne);
    detail_xhr = ajax(endpoint + TD.idOne + '/', 'GET', null, {}, 200, detail_data);
    xhr(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
  },
});

test('can deep link to the person who created the activity', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
  });
  ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, PF.detail());
  click('.t-link');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idOne}`);
  });
});

// "to-from" activities

//TODO: this is the line where chrome fails when running full test suite
test('can deep link to new assignee', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
  });
  ajax(`${PEOPLE_URL}${PD.idBoy}/`, 'GET', null, {}, 200, PF.detail(PD.idBoy));
  click('.t-to-from-new');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idBoy}`);
  });
});

test('can deep link to old assignee', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
  });
  ajax(`${PEOPLE_URL}${PD.idSearch}/`, 'GET', null, {}, 200, PF.detail(PD.idSearch));
  click('.t-to-from-old');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idSearch}`);
  });
});

test('deep links to the person who created the record (to-from)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
  });
  ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, PF.detail(PD.idOne));
  click('.t-link');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idOne}`);
  });
});

test('deep links to the automation that created the record (to-from)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.automation_assignee_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
  });
  ajax(`${AUTOMATION_URL}${AD.idOne}/`, 'GET', null, {}, 200, AF.detail(AD.idOne));
  click('.t-link');
  andThen(() => {
    assert.equal(currentURL(), `${BASEURLS.BASE_AUTOMATION_URL}/${AD.idOne}`);
  });
});

// "categories-activity"

test('deep links to the automation that created the record (categories-activity)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.categories_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
  });
  ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, PF.detail(PD.idOne));
  click('.t-link');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idOne}`);
  });
});

test('deep links to the automation that created the record (categories-activity)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.automation_categories_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
  });
  ajax(`${AUTOMATION_URL}${AD.idOne}/`, 'GET', null, {}, 200, AF.detail(AD.idOne));
  click('.t-link');
  andThen(() => {
    assert.equal(currentURL(), `${BASEURLS.BASE_AUTOMATION_URL}/${AD.idOne}`);
  });
});

// "cc-add-remove" : start

test('deep links to the automation that created the record (cc-add-remove)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_add_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
  });
  ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, PF.detail(PD.idOne));
  click('.t-link');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idOne}`);
  });
});

test('deep links to the automation that created the record (cc-add-remove)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.automation_cc_add_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
  });
  ajax(`${AUTOMATION_URL}${AD.idOne}/`, 'GET', null, {}, 200, AF.detail(AD.idOne));
  click('.t-link');
  andThen(() => {
    assert.equal(currentURL(), `${BASEURLS.BASE_AUTOMATION_URL}/${AD.idOne}`);
  });
});

// "cc-add-remove" : end

test('ticket detail shows the activity list including event data (assignee)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim().replace(/[\n]/gm, ''), `${PD.fullname} changed the assignee from ${PD.fullnameBoy2} to ${PD.fullnameBoy} a month ago`);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(1)`).text().trim().replace(/[\n]/gm, ''), `${PD.fullname} changed the assignee from ${PD.fullnameBoy2} to ${PD.fullnameBoy} a month ago`);
  });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (assignee)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only(TD.idTwo));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
  });
});

test('ticket detail shows the activity list including event data (create)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.created_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} created this ticket 3 months ago`);
  });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (create)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.created_only(TD.idTwo));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
  });
});

test('ticket detail counts are not shown unless they are greater than 0', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.created_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${'.t-activity-comment-counts'}`).text(), '');
    assert.equal(find(`${'.t-activity-status-counts'}`).text(), '');
  });
});

test('ticket detail shows the activity list including event data (status)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.status_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 3);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim().replace(/[\n]/gm, ''), `${PD.fullname} changed the status from ${TD.statusTwo} to ${TD.statusOne} a month ago`);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(1)`).text().trim().replace(/[\n]/gm, ''), `${PD.fullname} changed the status from ${TD.statusTwo} to ${TD.statusOne} a month ago`);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(2)`).text().trim().replace(/[\n]/gm, ''), `${PD.fullname} changed the status from ${TD.statusTwo} to ${TD.statusOne} a month ago`);
    assert.equal(parseInt(find(`${'.t-activity-status-counts'}`).text()), 3);
  });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (status)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.status_only(TD.idTwo));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
  });
});

test('ticket detail shows the activity list including event data (priority)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.priority_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 3);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim().replace(/[\n]/gm, ''), `${PD.fullname} changed the priority from ${TD.priorityTwo} to ${TD.priorityOne} 2 months ago`);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(1)`).text().trim().replace(/[\n]/gm, ''), `${PD.fullname} changed the priority from ${TD.priorityTwo} to ${TD.priorityOne} 2 months ago`);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(2)`).text().trim().replace(/[\n]/gm, ''), `${PD.fullname} changed the priority from ${TD.priorityTwo} to ${TD.priorityOne} 2 months ago`);
    assert.equal(parseInt(find(`${'.t-activity-all-counts'}`).text()), 3);
  });
});

test('ticket detail shows the activity list including event data (category)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.categories_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} changed the category from ${CD.nameTwo} to ${CD.nameOne} 3 months ago`);
  });
});

test('ticket detail shows the activity list including event data (multiple categories for to / from)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.categories_multiple_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} changed the category from ${CD.nameTwo}/${CD.namePlumbingChild} to ${CD.nameOne}/${CD.nameThree} 3 months ago`);
  });
});

test('ticket detail shows the activity list including event data (category multiple)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.categories_only(TD.idOne, 2));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} changed the category from ${CD.nameTwo} to ${CD.nameOne} 3 months ago`);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(1)`).text().trim(), `${PD.fullname} changed the category from ${CD.nameTwo} to ${CD.nameOne} 3 months ago`);
  });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (priority)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.priority_only(TD.idTwo));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
  });
});

//CC
test('ticket detail shows the activity list including event data (cc_add)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_add_only(1));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} added ${PD.fullnameBoy} to CC 15 days ago`);
  });
});

test('ticket detail shows the activity list including event data (multiple cc_add)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_add_only(2));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} added ${PD.fullnameBoy} ${PD.fullnameBoy} to CC 15 days ago`);
  });
});

test('can deep link to cc added (cc_add)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_add_only(1));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} added ${PD.fullnameBoy} to CC 15 days ago`);
  });
  ajax(`${PEOPLE_URL}${PD.idBoy}/`, 'GET', null, {}, 200, PF.detail(PD.idBoy));
  click('.t-ticket-cc-add-remove:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idBoy}`);
  });
});

test('can deep link to cc added (multiple cc_add)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_add_only(2));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} added ${PD.fullnameBoy} ${PD.fullnameBoy} to CC 15 days ago`);
  });
  ajax(`${PEOPLE_URL}${PD.idBoy}/`, 'GET', null, {}, 200, PF.detail(PD.idBoy));
  click('.t-ticket-cc-add-remove:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idBoy}`);
  });
  page.visitDetail();
  ajax(`${PEOPLE_URL}${PD.idSearch}/`, 'GET', null, {}, 200, PF.detail(PD.idSearch));
  click('.t-ticket-cc-add-remove:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idSearch}`);
  });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (cc_remove)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_remove_only(2, TD.idTwo));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
  });
});

test('ticket detail shows the activity list including event data (cc_remove)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_remove_only(1));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} removed ${PD.fullnameBoy} from CC 20 days ago`);
  });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (cc_remove)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_remove_only(2, TD.idTwo));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
  });
});

test('can deep link to cc removed (cc_remove)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_remove_only(1));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} removed ${PD.fullnameBoy} from CC 20 days ago`);
  });
  ajax(`${PEOPLE_URL}${PD.idBoy}/`, 'GET', null, {}, 200, PF.detail(PD.idBoy));
  click('.t-ticket-cc-add-remove:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idBoy}`);
  });
});

test('can deep link to cc removed (multiple cc_remove)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_remove_only(2));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} removed ${PD.fullnameBoy} ${PD.fullnameBoy} from CC 20 days ago`);
  });
  ajax(`${PEOPLE_URL}${PD.idBoy}/`, 'GET', null, {}, 200, PF.detail(PD.idBoy));
  click('.t-ticket-cc-add-remove:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idBoy}`);
  });
  page.visitDetail();
  ajax(`${PEOPLE_URL}${PD.idSearch}/`, 'GET', null, {}, 200, PF.detail(PD.idSearch));
  click('.t-ticket-cc-add-remove:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/${PD.idSearch}`);
  });
});

//ATTACHMENT
test('ticket detail does not show the activity list without a matching ticket for the activity (attachment_add)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.attachment_add_only(2, TD.idTwo));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
  });
});

test('ticket detail shows the activity list including event data (attachment_add)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.attachment_add_only(1));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(trim(find(`${ACTIVITY_ITEMS}:eq(0)`).text()), `${PD.fullname} uploaded 1 file 6 months ago ${GD.nameTicketAttachmentOne}`);
  });
});

test('ticket detail shows the activity list including event data (multiple attachment_add)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.attachment_add_only(2));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(trim(find(`${ACTIVITY_ITEMS}:eq(0)`).text()), `${PD.fullname} uploaded 2 files 6 months ago ${GD.nameTicketAttachmentOne} ${GD.nameTicketAttachmentTwo}`);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(0)').attr('href'), `${TAD.fileAttachmentAddOne}`);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(0) .t-ext-pdf').length, 1);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(1) img').length, 1);
  });
});
test('ticket detail shows the activity list including file attachment icons (multiple attachment_add)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.attachment_add_only(5));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(trim(find(`${ACTIVITY_ITEMS}:eq(0)`).text()), `${PD.fullname} uploaded 5 files 6 months ago ${GD.nameTicketAttachmentOne} ${GD.nameTicketAttachmentTwo} ${GD.nameTicketAttachmentThree} ${GD.nameTicketAttachmentFour} ${GD.nameTicketAttachmentFive}`);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(0)').attr('href'), `${TAD.fileAttachmentAddOne}`);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(0) .t-ext-pdf').length, 1);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(0) img').length, 0);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(1)').attr('href'), `${TAD.fileAttachmentAddTwo}`);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(1) .t-ext-jpg').length, 1);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(1) .t-ext-jpg > img').attr('src'), `${TAD.imageThumnailTwo}`);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(1) img').length, 1);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(2)').attr('href'), `${TAD.fileAttachmentAddThree}`);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(2) .t-ext-docx').length, 1);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(2) img').length, 0);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(3)').attr('href'), `${TAD.fileAttachmentAddFour}`);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(3) .t-ext-xlsx').length, 1);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(3) img').length, 0);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(4)').attr('href'), `${TAD.fileAttachmentAddFive}`);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(4) .t-ext-file').length, 1);
    assert.equal(find('.t-ticket-attachment-add-remove:eq(4) img').length, 0);
  });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (attachment_remove)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.attachment_remove_only(2, TD.idTwo));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
  });
});

test('ticket detail shows the activity list including event data (attachment_remove)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.attachment_remove_only(1));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(trim(find(`${ACTIVITY_ITEMS}:eq(0)`).text()), `${PD.fullname} removed 1 file 6 months ago ${GD.nameTicketAttachmentOne}`);
  });
});

test('ticket detail shows the activity list including event data (multiple attachment_remove)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.attachment_remove_only(2));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(trim(find(`${ACTIVITY_ITEMS}:eq(0)`).text()), `${PD.fullname} removed 2 files 6 months ago ${GD.nameTicketAttachmentOne} ${GD.nameTicketAttachmentTwo}`);
  });
});

//COMMENT
test('ticket detail shows the activity comment', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.comment_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} commented 4 months ago ${TD.commentOne}`);
    assert.equal(parseInt(find(`${'.t-activity-comment-counts'}`).text()), 1);
  });
});

test('ticket detail shows the activity comment with break', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.comment_only(TD.idOne, 1, TD.commentOneWithBreak));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0) p`).html().trim(), 'yeah commments are cool <strong>and so is this</strong> and so is this <em>and so is this</em>');
  });
});

test('ticket detail shows the activity comment (multiple activities with comments)', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.comment_only(TD.idOne, 2));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} commented 4 months ago ${TD.commentOne}`);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(1)`).text().trim(), `${PD.fullname} commented 4 months ago ${TD.commentOne}`);
  });
});

test('activities are sorted descending based on created at', function(assert) {
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.status_only());
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(`${ACTIVITY_ITEMS}`).length, 3);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim().replace(/[\n]/gm, ''), `${PD.fullname} changed the status from ${TD.statusTwo} to ${TD.statusOne} a month ago`);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(1)`).text().trim().replace(/[\n]/gm, ''), `${PD.fullname} changed the status from ${TD.statusTwo} to ${TD.statusOne} a month ago`);
    assert.equal(find(`${ACTIVITY_ITEMS}:eq(2)`).text().trim().replace(/[\n]/gm, ''), `${PD.fullname} changed the status from ${TD.statusTwo} to ${TD.statusOne} a month ago`);
  });
});
