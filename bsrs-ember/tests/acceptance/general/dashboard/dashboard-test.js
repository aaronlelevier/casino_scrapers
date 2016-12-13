import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TicketD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import RF from 'bsrs-ember/vendor/role_fixtures';
import LF from 'bsrs-ember/vendor/location_fixtures';
import CF from 'bsrs-ember/vendor/category_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import generalPage from 'bsrs-ember/tests/pages/general';
import { roleNewData } from 'bsrs-ember/tests/helpers/payloads/role';
import BASEURLS, { TICKETS_URL, TICKET_LIST_URL, LOCATIONS_URL, LOCATION_LIST_URL, LOCATION_LEVELS_URL, LOCATION_LEVEL_LIST_URL, PEOPLE_URL, PEOPLE_LIST_URL, 
  ROLES_URL, ROLE_LIST_URL, CATEGORY_LIST_URL, CATEGORIES_URL, TENANT_LIST_URL } from 'bsrs-ember/utilities/urls';

var application;

const PREFIX = config.APP.NAMESPACE;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const TICKET_NEW_URL = TICKET_LIST_URL + '/new/1';
const LOCATION_NEW_URL = BASEURLS.base_locations_url + '/new/1';
const LOCATION_LEVEL_NEW_URL = BASEURLS.base_location_levels_url + '/new/1';
const PEOPLE_NEW_URL = BASEURLS.base_people_url + '/new/1';
const ROLE_NEW_URL = BASEURLS.base_roles_url + '/new/1';
const CATEGORIES_NEW_URL = BASEURLS.base_categories_url + '/new/1';
const TENANT_NEW_URL = BASEURLS.BASE_TENANT_URL + '/new/1';
const BASE_URL = BASEURLS.base_tickets_url;
const PAGE_SIZE = config.APP.PAGE_SIZE;

moduleForAcceptance('Acceptance | general dashboard', {
  beforeEach() {
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TD.dashboard_text}});
  },
});

test('can click through dashboard links', function(assert) {
  visit(DASHBOARD_URL);
  click('[data-test-id="link-to-new-ticket"]');
  xhr(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
  });

  visit(DASHBOARD_URL);
  triggerEvent('[data-test-id="new-link-list"]', 'mouseenter');
  // xhr(`${PEOPLE_URL}?page=1`, 'GET', null, {}, 200, PF.list());
  click('[data-test-id="new-person"] > span');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_NEW_URL);
  });

  visit(DASHBOARD_URL);
  triggerEvent('[data-test-id="new-link-list"]', 'mouseenter');
  const setting_endpoint = `${PREFIX}${BASEURLS.base_roles_url}/route-data/new/`;
  xhr(setting_endpoint, 'GET', null, {}, 200, roleNewData);
  xhr(`${ROLES_URL}?page=1`, 'GET', null, {}, 200, RF.list());
  click('[data-test-id="new-role"] > span');
  andThen(() => {
    assert.equal(currentURL(), ROLE_NEW_URL);
  });

  visit(DASHBOARD_URL);
  triggerEvent('[data-test-id="new-link-list"]', 'mouseenter');
  // xhr(`${LOCATIONS_URL}?page=1`, 'GET', null, {}, 200, LF.list());
  click('[data-test-id="new-location"] > span');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_NEW_URL);
  });

  visit(DASHBOARD_URL);
  triggerEvent('[data-test-id="new-link-list"]', 'mouseenter');
  // xhr(`${LOCATION_LEVELS_URL}?page=1`, 'GET', null, {}, 200, LF.list());
  click('[data-test-id="new-location-level"] > span');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_NEW_URL);
  });

  visit(DASHBOARD_URL);
  triggerEvent('[data-test-id="new-link-list"]', 'mouseenter');
  // xhr(`${CATEGORIES_URL}?page=1`, 'GET', null, {}, 200, LF.list());
  click('[data-test-id="new-category"] > span');
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_NEW_URL);
  });

  visit(DASHBOARD_URL);
  triggerEvent('[data-test-id="new-link-list"]', 'mouseenter');
  // xhr(`${TENANT_URL}?page=1`, 'GET', null, {}, 200, LF.list());
  click('[data-test-id="new-tenant"] > span');
  andThen(() => {
    assert.equal(currentURL(), TENANT_NEW_URL);
  });

});

test('welcome h1 header and dashboard_text from settings', function(assert) {
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(document.title,  t('doctitle.dashboard.index'));
    assert.equal(find('.t-dashboard-text').text().trim(), 'Welcome');
    assert.equal(find('.t-dashboard-text h1').prop('tagName'), 'H1');
    assert.equal(find('.t-nav-list-home').length, 1);
    assert.equal(find('.t-nav-list-draft').length, 1);
    assert.equal(find('.t-nav-list-new').length, 1);
    assert.equal(find('.t-nav-list-in_progress').length, 1);
  });
});

test('clicking in progress tickets will send off xhr for person currents tickets as an assignee', function(assert) {
  visit(DASHBOARD_URL);
  var page_one = PREFIX + BASE_URL + `/?page=1&status=${TicketD.statusThreeId}&assignee=${PD.idDonald}`;
  xhr(page_one ,"GET",null,{},200,TF.list());
  click('.t-nav-list-in_progress');
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL + '/tickets-in-progress');
    assert.equal(find('.t-grid-title').text(), 'In Progress Tickets');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  });
});

test('clicking new tickets will send off xhr for person currents tickets as an assignee', function(assert) {
  visit(DASHBOARD_URL);
  var page_one = PREFIX + BASE_URL + `/?page=1&status=${TicketD.statusOneId}&assignee=${PD.idDonald}`;
  xhr(page_one ,"GET",null,{},200,TF.list());
  click('.t-nav-list-new');
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL + '/tickets-new');
    assert.equal(find('.t-grid-title').text(), 'New Tickets');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  });
});

test('clicking draft tickets will send off xhr for person currents tickets as an assignee', function(assert) {
  visit(DASHBOARD_URL);
  var page_one = PREFIX + BASE_URL + `/?page=1&status=${TicketD.statusSevenId}&assignee=${PD.idDonald}`;
  xhr(page_one ,"GET",null,{},200,TF.list());
  click('.t-nav-list-draft');
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL + '/draft');
    assert.equal(find('.t-grid-title').text(), 'Draft Tickets');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  });
});

test('the site logo on top left is clickable and redirects to the dashboard', function(assert) {
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
  });
  generalPage.visitAdmin();
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.base_admin_url);
  });
  generalPage.clickDashboard();
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
  });
});
