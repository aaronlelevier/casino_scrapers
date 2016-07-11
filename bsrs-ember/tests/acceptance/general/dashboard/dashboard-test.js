import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';

var application, store, endpoint;

const PREFIX = config.APP.NAMESPACE;
const DASHBOARD_URL = BASEURLS.dashboard_url;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;
const PAGE_SIZE = config.APP.PAGE_SIZE;

module('Acceptance | dashboard', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TD.dashboard_text}});
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('welcome h1 header and dashboard_text from settings', assert => {
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(find('.t-dashboard-text').text().trim(), 'Welcome');
    assert.equal(find('.t-dashboard-text h1').prop('tagName'), 'H1');
    assert.equal(find('.t-nav-list-home').length, 1);
    assert.equal(find('.t-nav-list-draft').length, 1);
    assert.equal(find('.t-nav-list-new').length, 1);
    assert.equal(find('.t-nav-list-in_progress').length, 1);
  });
});

/* jshint ignore:start */

test('clicking in progress tickets will send off xhr for person currents tickets as an assignee', async assert => {
  await visit(DASHBOARD_URL);
  var page_one = PREFIX + BASE_URL + `/?page=1&assignee=${PD.idDonald}`;
  xhr(page_one ,"GET",null,{},200,TF.list());
  await click('.t-nav-list-in_progress');
  assert.equal(currentURL(), DASHBOARD_URL + '/tickets-in-progress');
  assert.equal(find('.t-grid-title').text(), 'In Progress Tickets');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
});

test('clicking new tickets will send off xhr for person currents tickets as an assignee', async assert => {
  await visit(DASHBOARD_URL);
  var page_one = PREFIX + BASE_URL + `/?page=1&assignee=${PD.idDonald}`;
  xhr(page_one ,"GET",null,{},200,TF.list());
  await click('.t-nav-list-new');
  assert.equal(currentURL(), DASHBOARD_URL + '/tickets-new');
  assert.equal(find('.t-grid-title').text(), 'New Tickets');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
});

test('clicking draft tickets will send off xhr for person currents tickets as an assignee', async assert => {
  await visit(DASHBOARD_URL);
  var page_one = PREFIX + BASE_URL + `/?page=1&assignee=${PD.idDonald}`;
  xhr(page_one ,"GET",null,{},200,TF.list());
  await click('.t-nav-list-draft');
  assert.equal(currentURL(), DASHBOARD_URL + '/draft');
  assert.equal(find('.t-grid-title').text(), 'Draft Tickets');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
});

/* jshint ignore:end */
