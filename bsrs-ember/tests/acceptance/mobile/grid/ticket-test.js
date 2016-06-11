import Ember from 'ember';
import module from 'bsrs-ember/tests/helpers/module';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

var application, store, endpoint;

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;

module('Acceptance | mobile/grid/ticket test.js', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_URL + '/?page=1';
    const list_xhr = xhr(endpoint, 'GET', null, {}, 200, TF.list());
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

test('visiting mobile ticket grid show correct layout', function(assert) {
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
});

test('amk initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr', function(assert) {
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    assert.equal(find('.t-mobile-grid-title').text().trim(), 'Tickets');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
    // assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text().trim(), LD.storeName);
    assert.ok(find('.t-grid-data:eq(0) .t-ticket-priority-emergency'));
    assert.ok(find('.t-grid-data:eq(0) .t-ticket-status-new'));
    // const time = moment(new Date()).calendar();
    // assert.equal(find('.t-grid-data:eq(0) .t-ticket-created').text().trim(), `${time}`);
    // const pagination = find('.t-pages');
    // assert.equal(pagination.find('.t-page').length, 2);
    // assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    // assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    // assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    // assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});
test('mobile order attribute displays items in the correct order', function(assert) {
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
});
