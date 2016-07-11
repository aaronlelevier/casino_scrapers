import Ember from 'ember';
import module from 'bsrs-ember/tests/helpers/module';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import page from 'bsrs-ember/tests/pages/ticket-mobile';
import generalPage from 'bsrs-ember/tests/pages/general-mobile';

var application, store, endpoint, list_xhr;

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;
const DASHBOARD_URL = BASEURLS.dashboard_url;
const DETAIL_URL = `${BASE_URL}/index/${TD.idOne}`;
const ACTIVITY_ITEMS = '.t-activity-list-item';
// const SORT_ASSIGNEE_DIR = '.t-sort-assignee-fullname-dir';
// const FILTER_PRIORITY = '.t-filter-priority-translated-name';

module('Acceptance | grid mobile test', {
  beforeEach() {
    /* SETUP */
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_URL;
    list_xhr = xhr(endpoint+'/?page=1', 'GET', null, {}, 200, TF.list());
    /* MOBILE RENDER */
    const flexi = application.__container__.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const bp = {};
    breakpoints.forEach((point) => {
      bp[point.name] = point.begin + 5;
    });
    flexi.set('width', bp.mobile);
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('only renders grid items from server and not other ticket objects already in store', assert => {
  /* MOBILE doesn't clear out grid items on every route call to allow for infinite scrolling. If other tickets in store, this will fail */
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
    assert.equal(store.find('ticket-list').get('length'), 0);
  });
  clearxhr(list_xhr);
  xhr(endpoint+'/?page=1', 'GET', null, {}, 200, TF.list_two());
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    assert.equal(store.find('ticket-list').get('length'), 9);
  });
});

test('visiting mobile ticket grid show correct layout', assert => {
  visit(TICKET_URL);
  andThen(() => {
    const ticket = store.findOne('ticket-list');
    assert.equal(currentURL(), TICKET_URL);
    assert.equal(find('.t-mobile-grid-title').text().trim(), '19 Tickets');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').text().trim());
    assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').hasClass('t-ticket-categories'));
    assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
    assert.equal(find('.t-grid-data:eq(0) > div:eq(2)').text().trim(), t('ticket.status.new'));
    assert.ok(find('.t-grid-data:eq(0) > div:eq(2)').hasClass('t-ticket-status-translated_name'));
    assert.equal(find('.t-grid-data:eq(0) > div:eq(3)').text().trim(), t('ticket.priority.emergency'));
    assert.ok(find('.t-grid-data:eq(0) > div:eq(3)').hasClass('t-ticket-priority-translated_name'));
    assert.equal(find('.t-grid-data:eq(0) > div:eq(4)').text().trim(), LD.baseStoreName);
    assert.equal(find('.t-grid-data:eq(0) > div:eq(5)').text().trim(), ticket.get('assignee').get('fullname'));
    assert.equal(find('.t-grid-data:eq(0) > div:eq(6)').text().trim().split(' ')[0], 'Today');
    assert.equal(find('.t-grid-data:eq(0) > div:eq(6)').text().trim().split(' ')[1], 'at');
    assert.equal(find('.t-grid-data:eq(0) > div:eq(7)').text().trim(), ticket.get('number'));
  });
});
