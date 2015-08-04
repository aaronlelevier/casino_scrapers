import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;
const LOCATION_LEVEL_URL = "/admin/location-levels";
const DJANGO_LOCATION_LEVEL_URL = "/admin/location_levels/";

var application;

module('Acceptance | location-level-list', {
  beforeEach() {
    application = startApp();
    var endpoint = PREFIX + DJANGO_LOCATION_LEVEL_URL;
    xhr(endpoint ,"GET",null,{}, 200, LOCATION_LEVEL_FIXTURES.list() );
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /location-levels', function(assert) {
  visit(LOCATION_LEVEL_URL);

  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    assert.equal(find('h1.t-location-level').text(), 'Location Levels');
    assert.equal(find('tr.t-location-level-data').length, 3);
  });
});

