import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import config from 'bsrs-ember/config/environment';
import PD from 'bsrs-ember/vendor/defaults/person';
import PF from 'bsrs-ember/vendor/people_fixtures';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const TICKET_LIST_URL = `${BASEURLS.base_tickets_url}/index`;
const TICKET_DETAIL_URL = `${BASEURLS.base_tickets_url}/${TD.idOne}`;
const PEOPLE_DETAIL_URL = `${BASEURLS.base_people_url}/${PD.idOne}`;
const TOP_LEVEL_CATEGORIES_URL = `${PREFIX}/admin/categories/parents/`;
const TICKET_ACTIVITIES_URL = `${PREFIX}/tickets/${TD.idOne}/activity/`;

var application, store, person, ticket;

module('Acceptance | ticket and people test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('clicking between person detail and ticket detail will not dirty the active person model', (assert) => {
    ajax(`${PREFIX}${PEOPLE_DETAIL_URL}/`, 'GET', null, {}, 200, PF.detail(PD.idOne));
    visit(PEOPLE_DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_DETAIL_URL);
        person = store.find('person', PD.idOne);
        assert.ok(person.get('localeIsNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
    ajax(`${PREFIX}${BASEURLS.base_tickets_url}/?page=1`, 'GET', null, {}, 200, TF.list());
    visit(TICKET_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_LIST_URL);
        person = store.find('person', PD.idOne);
        assert.ok(person.get('localeIsNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
    ajax(`${PREFIX}${TICKET_DETAIL_URL}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
    ajax(TOP_LEVEL_CATEGORIES_URL, 'GET', null, {}, 200, CF.top_level());
    ajax(TICKET_ACTIVITIES_URL, 'GET', null, {}, 200, TA_FIXTURES.empty());
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), TICKET_DETAIL_URL);
        person = store.find('person', PD.idOne);
        assert.ok(person.get('localeIsNotDirty'));
        assert.equal(person.get('isDirtyOrRelatedDirty'), false);
        ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('isDirtyOrRelatedDirty'), false);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_DETAIL_URL);
        person = store.find('person', PD.idOne);
        assert.equal(person.get('isDirtyOrRelatedDirty'), false);
        ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('isDirtyOrRelatedDirty'), false);
    });
    click('.t-tab:eq(1)');
    andThen(() => {
        assert.equal(currentURL(), TICKET_DETAIL_URL);
        person = store.find('person', PD.idOne);
        assert.equal(person.get('isDirtyOrRelatedDirty'), false);
        ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('isDirtyOrRelatedDirty'), false);
    });
});
