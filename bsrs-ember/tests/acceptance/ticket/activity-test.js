import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import {ticket_payload, required_ticket_payload, ticket_payload_detail, ticket_payload_detail_one_category} from 'bsrs-ember/tests/helpers/payloads/ticket';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import PF from 'bsrs-ember/vendor/people_fixtures';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/tickets';
import generalPage from 'bsrs-ember/tests/pages/general';
import selectize from 'bsrs-ember/tests/pages/selectize';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;
const TICKET_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
const ACTIVITY_ITEMS = '.t-activity-list-item';

let application, store, endpoint, list_xhr, detail_xhr, top_level_xhr, detail_data, random_uuid, original_uuid;

module('Acceptance | ticket activity test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = `${PREFIX}${BASE_URL}/`;
        detail_data = TF.detail(TD.idOne);
        detail_xhr = ajax(endpoint + TD.idOne + '/', 'GET', null, {}, 200, detail_data);
        let top_level_categories_endpoint = `${PREFIX}/admin/categories/?parent__isnull=True`;
        top_level_xhr = ajax(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('can deep link to the person who created the activity', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
    });
    ajax(`/api/admin/people/${PD.idOne}/`, 'GET', null, {}, 200, PF.detail());
    click('.t-person-activity');
    andThen(() => {
        assert.equal(currentURL(), `/admin/people/${PD.idOne}`);
    });
});

test('can deep link to new assignee', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
    });
    ajax(`/api/admin/people/${PD.idBoy}/`, 'GET', null, {}, 200, PF.detail(PD.idBoy));
    click('.t-to-from-new');
    andThen(() => {
        assert.equal(currentURL(), `/admin/people/${PD.idBoy}`);
    });
});

test('can deep link to old assignee', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
    });
    ajax(`/api/admin/people/${PD.idSearch}/`, 'GET', null, {}, 200, PF.detail(PD.idSearch));
    click('.t-to-from-old');
    andThen(() => {
        assert.equal(currentURL(), `/admin/people/${PD.idSearch}`);
    });
});

test('ticket detail shows the activity list including event data (assignee)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} changed the assignee from ${PD.fullnameBoy} to ${PD.fullnameBoy2} a month ago`);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(1)`).text().trim(), `${PD.fullname} changed the assignee from ${PD.fullnameBoy} to ${PD.fullnameBoy2} a month ago`);
    });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (assignee)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only(TD.idTwo));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
    });
});

test('ticket detail shows the activity list including event data (create)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.created_only());
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} created this ticket 3 months ago`);
    });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (create)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.created_only(TD.idTwo));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
    });
});

test('ticket detail shows the activity list including event data (status)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.status_only());
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 3);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} changed the status from ${TD.statusOne} to ${TD.statusTwo} a month ago`);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(1)`).text().trim(), `${PD.fullname} changed the status from ${TD.statusOne} to ${TD.statusTwo} a month ago`);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(2)`).text().trim(), `${PD.fullname} changed the status from ${TD.statusOne} to ${TD.statusTwo} a month ago`);
    });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (status)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.status_only(TD.idTwo));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
    });
});

test('ticket detail shows the activity list including event data (priority)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.priority_only());
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 3);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} changed the priority from ${TD.priorityOne} to ${TD.priorityTwo} 2 months ago`);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(1)`).text().trim(), `${PD.fullname} changed the priority from ${TD.priorityOne} to ${TD.priorityTwo} 2 months ago`);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(2)`).text().trim(), `${PD.fullname} changed the priority from ${TD.priorityOne} to ${TD.priorityTwo} 2 months ago`);
    });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (priority)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.priority_only(TD.idTwo));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
    });
});

test('ticket detail shows the activity list including event data (cc_add)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_add_only(1));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
        assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} added ${PD.fullnameBoy} to CC 15 days ago`);
    });
});

test('ticket detail shows the activity list including event data (multiple cc_add)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_add_only(2));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
        assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} added ${PD.fullnameBoy} ${PD.fullnameBoy} to CC 15 days ago`);
    });
});

test('can deep link to cc added (cc_add)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_add_only(1));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
        assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} added ${PD.fullnameBoy} to CC 15 days ago`);
    });
    ajax(`/api/admin/people/${PD.idBoy}/`, 'GET', null, {}, 200, PF.detail(PD.idBoy));
    click('.t-ticket-cc-add-remove:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), `/admin/people/${PD.idBoy}`);
    });
});

test('can deep link to cc added (multiple cc_add)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_add_only(2));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
        assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} added ${PD.fullnameBoy} ${PD.fullnameBoy} to CC 15 days ago`);
    });
    ajax(`/api/admin/people/${PD.idBoy}/`, 'GET', null, {}, 200, PF.detail(PD.idBoy));
    click('.t-ticket-cc-add-remove:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), `/admin/people/${PD.idBoy}`);
    });
    page.visitDetail();
    ajax(`/api/admin/people/${PD.idSearch}/`, 'GET', null, {}, 200, PF.detail(PD.idSearch));
    click('.t-ticket-cc-add-remove:eq(1)');
    andThen(() => {
        assert.equal(currentURL(), `/admin/people/${PD.idSearch}`);
    });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (cc_add)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_add_only(2, TD.idTwo));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
    });
});

test('ticket detail shows the activity list including event data (cc_remove)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_remove_only(1));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
        assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} removed ${PD.fullnameBoy} from CC 15 days ago`);
    });
});

test('ticket detail does not show the activity list without a matching ticket for the activity (cc_remove)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_remove_only(2, TD.idTwo));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 0);
    });
});

test('can deep link to cc removed (cc_remove)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_remove_only(1));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
        assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} removed ${PD.fullnameBoy} from CC 15 days ago`);
    });
    ajax(`/api/admin/people/${PD.idBoy}/`, 'GET', null, {}, 200, PF.detail(PD.idBoy));
    click('.t-ticket-cc-add-remove:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), `/admin/people/${PD.idBoy}`);
    });
});

test('can deep link to cc removed (multiple cc_remove)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_remove_only(2));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
        assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} removed ${PD.fullnameBoy} ${PD.fullnameBoy} from CC 15 days ago`);
    });
    ajax(`/api/admin/people/${PD.idBoy}/`, 'GET', null, {}, 200, PF.detail(PD.idBoy));
    click('.t-ticket-cc-add-remove:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), `/admin/people/${PD.idBoy}`);
    });
    page.visitDetail();
    ajax(`/api/admin/people/${PD.idSearch}/`, 'GET', null, {}, 200, PF.detail(PD.idSearch));
    click('.t-ticket-cc-add-remove:eq(1)');
    andThen(() => {
        assert.equal(currentURL(), `/admin/people/${PD.idSearch}`);
    });
});
