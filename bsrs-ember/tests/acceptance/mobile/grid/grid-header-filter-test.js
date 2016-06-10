import Ember from 'ember';
import module from 'bsrs-ember/tests/helpers/module';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

var application, store, endpoint;

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;

module('Acceptance | grid-head mobile', {
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

test('clicking on filter icon will show filters and cancel will close it out', function(assert) {
  visit(TICKET_URL);
  click('.t-mobile-filter');
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    assert.ok(find('.t-mobile-filters'));
    assert.equal(find('.t-mobile-filter-title').text(), t('grid.filter.other'));
    assert.equal(find('.t-mobile-filter-first-btn').text(), t('crud.cancel.button'));
    assert.equal(find('.t-mobile-filter-second-btn').text(), t('grid.filter'));
  });
  click('.t-mobile-filter-first-btn');
  andThen(() => {
    assert.throws(find('.t-mobile-filters'));
  });
});
