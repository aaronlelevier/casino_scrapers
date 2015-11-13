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
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/tickets';
import generalPage from 'bsrs-ember/tests/pages/general';
import selectize from 'bsrs-ember/tests/pages/selectize';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TD.idOne;
const TICKET_PUT_URL = PREFIX + DETAIL_URL + '/';
const ACTIVITY_ITEMS = '.t-activity-list-item';

let application, store, endpoint, list_xhr, detail_xhr, top_level_xhr, detail_data, random_uuid, original_uuid;

module('sco Acceptance | ticket activity test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        detail_data = TF.detail(TD.idOne);
        detail_xhr = ajax(endpoint + TD.idOne + '/', 'GET', null, {}, 200, detail_data);
        let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
        top_level_xhr = ajax(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('ticket detail shows the activity list including event data (assignee)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text(), `${PD.fullname} changed the assignee from ${PD.fullnameBoy} to ${PD.fullnameBoy2}`);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(1)`).text(), `${PD.fullname} changed the assignee from ${PD.fullnameBoy} to ${PD.fullnameBoy2}`);
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
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text(), `${PD.fullname} created this ticket`);
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
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text(), `${PD.fullname} changed the status from ${TD.statusOne} to ${TD.statusTwo}`);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(1)`).text(), `${PD.fullname} changed the status from ${TD.statusOne} to ${TD.statusTwo}`);
        assert.equal(find(`${ACTIVITY_ITEMS}:eq(2)`).text(), `${PD.fullname} changed the status from ${TD.statusOne} to ${TD.statusTwo}`);
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

test('ticket detail shows the activity list including event data (cc_add)', (assert) => {
    ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.cc_add_only(1));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
        assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text(), `${PD.fullname} added person1 to CC`);
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
        assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text(), `${PD.fullname} removed person1 from CC`);
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
