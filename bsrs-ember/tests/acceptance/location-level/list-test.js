import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_location_levels_url;
const LOCATION_LEVEL_URL = BASE_URL + '/index';

let application;

module('Acceptance | location-level-list', {
  beforeEach() {
    application = startApp();
    let endpoint = PREFIX + BASE_URL + '/';
    xhr(endpoint + '?page=1' ,'GET',null,{}, 200, LOCATION_LEVEL_FIXTURES.list() );
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /location-levels', function(assert) {
  visit(LOCATION_LEVEL_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    assert.equal(find('.t-grid-data').length, 10);
  });
});
