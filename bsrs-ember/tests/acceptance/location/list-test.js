import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;
const LOCATION_URL = "/admin/locations";
const DJANGO_LOCATION_URL = "/admin/locations/";

var application;

module('Acceptance | location-list', {
  beforeEach() {
    application = startApp();
    var endpoint = PREFIX + DJANGO_LOCATION_URL;
    xhr(endpoint,"GET", null, {}, 200, LOCATION_FIXTURES.list() );
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /locations', (assert) => {
  visit(LOCATION_URL);

  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    assert.equal(find('h1.t-location').text(), 'Locations');
    assert.equal(find('tr.t-location-data').length, 5);
  });
});


